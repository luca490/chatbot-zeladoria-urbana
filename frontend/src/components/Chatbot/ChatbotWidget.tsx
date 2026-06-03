"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Image as ImageIcon, MapPin, Loader2, X, CheckCircle2, Ticket, Mic, Square, Navigation, Play, ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";

import { motion, AnimatePresence } from "framer-motion";

import { getBriefDescription, getStatusColor } from "@/lib/ticketUtils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSocket } from "@/hooks/useSocket";
import { useTickets } from "@/hooks/useTickets";

type Ticket = {
  id: string;
  protocol: string;
  status: string;
  created_at: string;
  description: string;
};

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
  image?: string;
  isLocation?: boolean;
  locationText?: string;
  isAudio?: boolean;
  transcription?: string;
};

export default function ChatbotWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState<{ name: string; phone: string } | null>(null);
  const [generatedProtocol, setGeneratedProtocol] = useState<string | null>(null);

  const socket = useSocket(!!user);
  const { tickets: userTickets, fetchTickets: fetchUserTickets } = useTickets(user?.phone);

  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");

  const [showHistory, setShowHistory] = useState(false);

  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [customLocation, setCustomLocation] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResults, setSearchResults] = useState<{name: string, address: string, lat: string, lon: string}[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: "-23.6815", lon: "-46.6205", bbox: "-46.6669%2C-23.7169%2C-46.5866%2C-23.6644" });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (socket && user) {
      socket.on("connect", () => {
        socket.emit("chat_message", { isInitial: true, user });
      });

      socket.on("bot_response", (data: { text: string }) => {
        setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "bot", text: data.text }]);
        
        const protocolMatch = data.text.match(/\*\*([A-Z0-9]{8})\*\*/);
        if (protocolMatch) {
          setTimeout(() => setGeneratedProtocol(protocolMatch[1]), 1500);
        }
      });

      socket.on("bot_typing", (typing: boolean) => {
        setIsTyping(typing);
      });

      socket.on("audio_transcribed", (data: { id: string, text: string }) => {
        setMessages((prev) => prev.map(msg => 
          msg.id === data.id ? { ...msg, transcription: data.text } : msg
        ));
      });

      return () => {
        socket.off("connect");
        socket.off("bot_response");
        socket.off("bot_typing");
        socket.off("audio_transcribed");
      };
    }
  }, [socket, user]);

  useEffect(() => {
    if (showHistory) {
      fetchUserTickets();
    }
  }, [showHistory, fetchUserTickets]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (formName.trim() && formPhone.replace(/\D/g, '').length >= 10) {
      setUser({ name: formName, phone: formPhone });
    }
  };

  const applyPhoneMask = (val: string) => {
    return val
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d)(\d{4})$/, "$1-$2")
      .substring(0, 15);
  };

  const sendLocationMessage = (locationText: string) => {
    setSelectedLocation(locationText);
    setShowLocationModal(false);
    setCustomLocation("");
  };

  const handleCurrentLocationClick = () => {
    if (isGettingLocation) return;
    if ("geolocation" in navigator) {
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`)
            .then(res => res.json())
            .then(data => {
              const address = data.display_name || `Lat: ${latitude}, Lng: ${longitude}`;
              sendLocationMessage(address);
            })
            .catch(() => sendLocationMessage(`Lat: ${latitude}, Lng: ${longitude}`))
            .finally(() => setIsGettingLocation(false));
        },
        () => {
          alert("Não foi possível obter a localização.");
          setIsGettingLocation(false);
        }
      );
    } else {
      alert("Geolocalização não é suportada neste navegador.");
    }
  };

  useEffect(() => {
    if (!customLocation.trim()) {
      setSearchResults([]);
      setSearchError("");
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      setSearchError("");
      try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(customLocation)}&lat=-23.6815&lon=-46.6205&limit=4`);
        const data = await res.json();
        
        if (data && data.features && data.features.length > 0) {
          const results = data.features.map((f: any) => {
            const p = f.properties;
            const addressParts = [p.name, p.street, p.housenumber, p.district, p.city, p.state].filter(Boolean);
            const address = addressParts.join(', ');
            return {
              name: p.name || customLocation,
              address: address,
              lat: f.geometry.coordinates[1].toString(),
              lon: f.geometry.coordinates[0].toString(),
              extent: p.extent
            };
          });
          setSearchResults(results);

          const first = results[0];
          let bboxStr = "-46.6669%2C-23.7169%2C-46.5866%2C-23.6644";
          if (first.extent) {
            bboxStr = `${first.extent[0]}%2C${first.extent[1]}%2C${first.extent[2]}%2C${first.extent[3]}`;
          } else {
             const lat = parseFloat(first.lat);
             const lon = parseFloat(first.lon);
             bboxStr = `${lon - 0.01}%2C${lat - 0.01}%2C${lon + 0.01}%2C${lat + 0.01}`;
          }
          
          setMapCenter({
            lat: first.lat,
            lon: first.lon,
            bbox: bboxStr
          });
        } else {
          setSearchResults([]);
          setSearchError("Local não encontrado.");
        }
      } catch (err) {
        console.error(err);
        setSearchError("Erro ao buscar localização.");
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [customLocation]);

  const handleCustomLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          
          const newMessage: Message = {
            id: Date.now().toString(),
            sender: "user",
            text: "🔊 Áudio enviado para transcrição...",
            isAudio: true
          };
          setMessages((prev) => [...prev, newMessage]);

          socket?.emit('audio_message', {
            id: newMessage.id,
            audioBase64: base64Audio,
            user
          });
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert("Não foi possível acessar o microfone. Verifique as permissões do navegador.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSend = () => {
    if ((!input.trim() && !image && !selectedLocation) || !socket) return;

    let textToSend = input;
    if (selectedLocation) {
      textToSend += `\n[Localização Selecionada pelo Cidadão]: ${selectedLocation}`;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input || (selectedLocation ? "📍 Localização enviada" : ""),
      image: image ? URL.createObjectURL(image) : undefined,
      isLocation: !!selectedLocation,
      locationText: selectedLocation || undefined,
    };

    setMessages((prev) => [...prev, newMessage]);

    if (image) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target?.result as string;
        socket.emit("chat_message", {
          message: textToSend,
          user,
          imageUrl: base64Image,
        });
      };
      reader.readAsDataURL(image);
    } else {
      socket.emit("chat_message", {
        message: textToSend,
        user,
        imageUrl: null,
      });
    }

    setInput("");
    setImage(null);
    setSelectedLocation(null);
  };

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto p-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl"
      >
        <h2 className="text-2xl font-display font-bold mb-2 text-white">Identifique-se</h2>
        <p className="text-[var(--color-muted)] mb-6 text-sm">Precisamos de seus dados para registrar e acompanhar o seu chamado.</p>

        <form onSubmit={handleStart} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">Nome Completo</label>
            <Input
              required
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="João da Silva"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">Telefone (WhatsApp)</label>
            <Input
              required
              type="tel"
              value={formPhone}
              onChange={(e) => setFormPhone(applyPhoneMask(e.target.value))}
              placeholder="(11) 99999-9999"
              maxLength={15}
            />
          </div>
          <Button type="submit" className="w-full mt-4 py-3">
            Iniciar Atendimento
          </Button>
        </form>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col relative w-full max-w-2xl mx-auto h-[600px] max-h-[80vh] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="p-4 border-b border-[var(--color-border)] bg-black/20 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-black font-bold text-xl">
            Z
          </div>
          <div>
            <h3 className="font-display font-bold text-white leading-tight">Zeladoria Diadema</h3>
            <p className="text-xs text-[var(--color-accent)] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse"></span> Online
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2"
        >
          <Ticket className="w-4 h-4" />
          {showHistory ? "Voltar ao Chat" : "Meus Chamados"}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-black/10">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3",
                msg.sender === "user"
                  ? "bg-[var(--color-accent)] text-black ml-auto rounded-br-sm"
                  : "bg-black/40 text-white border border-[var(--color-border)] rounded-bl-sm"
              )}
            >
              {msg.isLocation && msg.locationText && (
                <div className="bg-[#0b141a] rounded-lg overflow-hidden border border-[#202c33] max-w-[280px] shadow-sm cursor-pointer mb-2">
                  <div className="h-28 w-full bg-[#111b21] relative flex items-center justify-center">
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M10 10h80v80H10z\' fill=\'none\' stroke=\'%23333\' stroke-width=\'2\'/%3E%3Cpath d=\'M30 30l40 40M70 30L30 70\' stroke=\'%23333\' stroke-width=\'2\'/%3E%3C/svg%3E")', backgroundSize: 'cover' }}></div>
                    <MapPin className="w-8 h-8 text-red-500 relative z-10 drop-shadow-lg" fill="#ef4444" />
                  </div>
                  <div className="p-3 bg-black/40">
                    <p className="text-[var(--color-accent)] font-semibold text-xs uppercase tracking-wider mb-1">Localização Selecionada</p>
                    <p className="text-white/90 text-xs mt-1 line-clamp-2">{msg.locationText}</p>
                  </div>
                </div>
              )}
              {msg.isAudio ? (
                <div className="flex flex-col min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <Mic className="w-5 h-5 opacity-70" />
                    <span className="font-medium italic">Áudio enviado</span>
                  </div>
                  {msg.transcription ? (
                    <p className="text-sm font-medium italic border-t border-black/10 pt-2 mt-2">"{msg.transcription}"</p>
                  ) : (
                    <p className="text-xs italic opacity-70 flex items-center gap-1 mt-2 pt-2 border-t border-black/10"><Loader2 className="w-3 h-3 animate-spin"/> Transcrevendo...</p>
                  )}
                </div>
              ) : (
                <>
                  {msg.image && (
                    <img src={msg.image} alt="Upload" className="w-full max-w-xs rounded-lg mb-2 border border-black/10" />
                  )}
                  {msg.text && !msg.text.includes("📍 Localização enviada") && (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-black/40 text-[var(--color-muted)] border border-[var(--color-border)] rounded-2xl rounded-bl-sm px-4 py-3 max-w-fit flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Analisando...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-black/20 border-t border-[var(--color-border)]">
        {(image || selectedLocation) && (
          <div className="mb-3 flex flex-wrap gap-2">
            {image && (
              <div className="relative inline-block">
                <img src={URL.createObjectURL(image)} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-[var(--color-border)] shadow" />
                <button
                  onClick={() => setImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {selectedLocation && (
              <div className="relative inline-flex items-center gap-2 bg-[#0b141a] border border-[#202c33] rounded-lg p-2 pr-4 shadow-sm h-16 max-w-[200px]">
                <div className="h-full w-12 bg-[#111b21] rounded relative flex items-center justify-center overflow-hidden shrink-0">
                  <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M10 10h80v80H10z\' fill=\'none\' stroke=\'%23333\' stroke-width=\'2\'/%3E%3Cpath d=\'M30 30l40 40M70 30L30 70\' stroke=\'%23333\' stroke-width=\'2\'/%3E%3C/svg%3E")', backgroundSize: 'cover' }}></div>
                  <MapPin className="w-5 h-5 text-red-500 relative z-10" fill="#ef4444" />
                </div>
                <div className="flex flex-col justify-center overflow-hidden">
                  <span className="text-[var(--color-accent)] font-semibold text-[10px] uppercase">Local Selecionado</span>
                  <span className="text-white text-xs line-clamp-1">{selectedLocation}</span>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex items-end gap-2">
          <label title="Anexar Imagem" className="cursor-pointer p-3 rounded-full hover:bg-white/5 text-[var(--color-muted)] hover:text-white transition-colors">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
            <ImageIcon className="w-6 h-6" />
          </label>
          <button 
            title="Anexar Localização"
            onClick={() => setShowLocationModal(true)}
            className="p-3 rounded-full hover:bg-white/5 text-[var(--color-muted)] hover:text-white transition-colors"
          >
            <MapPin className="w-6 h-6" />
          </button>

          {isRecording ? (
            <div className="flex-1 flex items-center bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3.5 gap-3 animate-pulse">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-red-500 font-bold flex-1 text-sm">
                Gravando... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
              </span>
              <button title="Parar Gravação" onClick={stopRecording} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                <Square className="w-4 h-4" fill="currentColor" />
              </button>
            </div>
          ) : (
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Descreva o problema ou envie um áudio..."
                className="w-full h-[52px] bg-black/40 border border-[var(--color-border)] rounded-xl px-4 py-3.5 pl-4 pr-12 text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] resize-none transition-all leading-tight"
              />
              {!input.trim() && !image ? (
                <button
                  title="Gravar Áudio"
                  onClick={startRecording}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-transparent text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 rounded-full transition-colors"
                >
                  <Mic className="w-5 h-5" />
                </button>
              ) : (
                <button
                  title="Enviar"
                  onClick={handleSend}
                  disabled={!input.trim() && !image}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[var(--color-accent)] text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tela de Histórico do Cidadão */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="absolute inset-0 bg-[var(--color-surface)] z-40 flex flex-col pt-[72px]"
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <h4 className="text-white font-bold font-display text-xl mb-4">Meus Protocolos</h4>
              {userTickets.length === 0 ? (
                <div className="text-center text-[var(--color-muted)] py-10">
                  <Ticket className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Você ainda não tem nenhum chamado registrado.</p>
                </div>
              ) : (
                userTickets.map(ticket => (
                  <div key={ticket.id} className="bg-black/40 border border-[var(--color-border)] rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-bold text-white font-display uppercase">#{ticket.protocol}</span>
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full border", getStatusColor(ticket.status))}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-muted)] line-clamp-2 leading-relaxed">
                      {getBriefDescription(ticket.description)}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]/50 mt-3">
                      Aberto em {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Chamado Criado */}
      <AnimatePresence>
        {generatedProtocol && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            onClick={() => {
              setGeneratedProtocol(null);
              fetchUserTickets(); // refresh history just in case
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center space-y-4 cursor-default"
            >
              <div className="w-16 h-16 bg-[var(--color-accent)]/20 text-[var(--color-accent)] rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display font-bold text-white">Chamado Registrado!</h3>
              
              <div className="bg-black/50 border border-white/5 rounded-xl p-4 my-4">
                <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">Seu Protocolo</p>
                <div className="flex items-center justify-center gap-2 text-2xl font-display font-bold text-[var(--color-accent)]">
                  <Ticket className="w-5 h-5" />
                  {generatedProtocol}
                </div>
              </div>

              <div className="text-sm text-[var(--color-muted)] space-y-2 text-left bg-white/5 p-4 rounded-xl">
                <p className="font-bold text-white mb-2">O que acontece agora?</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>A equipe da prefeitura já recebeu seu relato.</li>
                  <li>Sempre que houver novidades, você será avisado no WhatsApp.</li>
                  <li>Guarde este protocolo se precisar fazer consultas futuras.</li>
                </ul>
              </div>

              <Button
                onClick={() => setGeneratedProtocol(null)}
                className="w-full mt-4 py-3"
              >
                Voltar ao Chat
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showLocationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center sm:p-6"
            onClick={() => setShowLocationModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] text-white sm:rounded-2xl w-full max-w-sm shadow-2xl cursor-default flex flex-col overflow-hidden max-h-[80vh]"
            >
              <div className="flex items-center gap-4 p-4 border-b border-[var(--color-border)]">
                <button onClick={() => setShowLocationModal(false)}><ArrowLeft className="w-6 h-6 text-white cursor-pointer" /></button>
                <h3 className="text-lg font-bold flex-1 font-display">Enviar localização</h3>
              </div>
              
              <div className="h-32 w-full relative overflow-hidden shrink-0 border-b border-[var(--color-border)] transition-all">
                <iframe 
                  key={mapCenter.lat}
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight={0} 
                  marginWidth={0} 
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.bbox}&amp;layer=mapnik&amp;marker=${mapCenter.lat}%2C${mapCenter.lon}`}
                  className="absolute inset-0 opacity-80"
                  style={{ filter: 'invert(90%) hue-rotate(180deg)' }}
                ></iframe>
              </div>

              <div className="flex-1 overflow-y-auto pb-4">
                <div className="px-4 py-3 text-[11px] font-bold text-[var(--color-accent)] uppercase tracking-wider mt-2">
                  Busca Manual
                </div>
                
                <form onSubmit={handleCustomLocationSubmit} className="px-4 mb-2 flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      placeholder="Digite o endereço exato..."
                    />
                    {isSearching && (
                      <Loader2 className="w-4 h-4 text-[var(--color-accent)] animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                </form>

                {searchError && customLocation.trim() && !isSearching && (
                  <p className="px-4 text-xs text-red-400 mb-2">{searchError}</p>
                )}

                {searchResults.length > 0 && (
                  <div className="mb-2">
                    <div className="px-4 py-2 text-[11px] font-bold text-[var(--color-accent)] uppercase tracking-wider border-t border-[var(--color-border)]">
                      Resultados da Busca
                    </div>
                    {searchResults.map((loc, i) => (
                      <button 
                        key={`res-${i}`}
                        onClick={() => { setSelectedLocation(`${loc.address}`); setShowLocationModal(false); setSearchResults([]); setCustomLocation(""); }}
                        className="flex items-center gap-3 px-4 py-2 w-full hover:bg-white/5 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)] border border-[var(--color-accent)]/20 shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="text-left flex-1 border-b border-[var(--color-border)] pb-2">
                          <p className="text-sm font-bold text-white line-clamp-1">{loc.address.split(',')[0]}</p>
                          <p className="text-xs text-[var(--color-muted)] truncate max-w-[260px]">{loc.address}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="px-4 py-3 text-[11px] font-bold text-[var(--color-accent)] uppercase tracking-wider border-t border-[var(--color-border)] mt-2">
                  Opções Rápidas
                </div>
                
                <button 
                  onClick={handleCurrentLocationClick}
                  disabled={isGettingLocation}
                  className="flex items-center gap-3 px-4 py-2 w-full hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center shrink-0">
                    {isGettingLocation ? <Loader2 className="w-4 h-4 text-[var(--color-accent)] animate-spin" /> : <Navigation className="w-4 h-4 text-[var(--color-accent)]" />}
                  </div>
                  <div className="text-left flex-1 border-b border-[var(--color-border)] pb-2">
                    <p className="text-sm font-bold text-white">
                      {isGettingLocation ? "Buscando localização..." : "Enviar minha Localização GPS"}
                    </p>
                  </div>
                </button>
                
                {[
                  { name: "Prefeitura Municipal de Diadema", address: "R. Almirante Barroso, 111 - Vila Santa Dirce, Diadema - SP" },
                  { name: "Terminal Diadema", address: "Av. Conceição, Diadema - SP" },
                  { name: "Shopping Praça da Moça", address: "R. Manoel da Nóbrega, 712 - Centro, Diadema - SP" },
                  { name: "Hospital Quarteirão da Saúde", address: "Av. Antônio Piranga, 700 - Centro, Diadema - SP" }
                ].map((loc, i) => (
                  <button 
                    key={i}
                    onClick={() => { setSelectedLocation(`${loc.name} - ${loc.address}`); setShowLocationModal(false); }}
                    className="flex items-center gap-3 px-4 py-2 w-full hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 border border-[var(--color-border)] shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="text-left flex-1 border-b border-[var(--color-border)] pb-2">
                      <p className="text-sm font-bold text-white">{loc.name}</p>
                      <p className="text-xs text-[var(--color-muted)] truncate max-w-[260px]">{loc.address}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
