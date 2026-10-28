import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Send,
  Paperclip,
  Smile,
  Reply,
  ArrowLeft,
  Users,
  MessageCircle,
  SlidersHorizontal,
  X,
  Bell,
  BellOff,
  Download,
  Shield,
  Trash2,
} from "lucide-react";
import {
  listMessengerConversations,
  listMessengerMessages,
  markConversationRead,
  reactMessage,
  sendMessengerMessage,
  subscribeMessenger,
  addMessageAttachment,
} from "../services/messenger";
import { uploadCrewFile, signedCrewUrl } from "../services/storage";
import { useAuth } from "../contexts/AuthContext";

const demoConvs = [
  { id: "technik", name: "Technik", type: "group", preview: "Lichtcheck ist fertig.", unread: 3 },
  { id: "aufbau", name: "Aufbau", type: "group", preview: "Treffpunkt 10:00 Uhr", unread: 0 },
  { id: "max", name: "Max T.", type: "direct", preview: "Bin gleich am Main Floor.", unread: 1 },
];

const demoMsgs: any = {
  technik: [
    {
      id: "1",
      sender_id: "x",
      body: "Patchliste ist im Dateiarchiv.",
      created_at: new Date(Date.now() - 1800000).toISOString(),
      KT_profiles: { display_name: "Max" },
      KT_message_reactions: [{ id: "r", emoji: "👍" }],
      KT_message_attachments: [
        { id: "a1", file_name: "Patchliste-2026.pdf", mime_type: "application/pdf", size_bytes: 248000 },
      ],
    },
    {
      id: "2",
      sender_id: "me",
      body: "Perfekt, ich mache danach den Lichtcheck an der Main Stage.",
      created_at: new Date(Date.now() - 900000).toISOString(),
      KT_profiles: { display_name: "Du" },
      KT_message_reactions: [],
      KT_message_attachments: [],
    },
  ],
  aufbau: [
    {
      id: "3",
      sender_id: "x",
      body: "Treffpunkt 10:00 Uhr am Lager.",
      created_at: new Date().toISOString(),
      KT_profiles: { display_name: "Sarah" },
      KT_message_reactions: [],
      KT_message_attachments: [],
    },
  ],
  max: [
    {
      id: "4",
      sender_id: "x",
      body: "Bin gleich am Main Floor.",
      created_at: new Date().toISOString(),
      KT_profiles: { display_name: "Max T." },
      KT_message_reactions: [],
      KT_message_attachments: [],
    },
  ],
};

const demoParticipants: Record<string, { name: string; role: string; handle: string }[]> = {
  technik: [
    { name: "Max", role: "Crew", handle: "@max" },
    { name: "Jana", role: "Teamleitung", handle: "@jana" },
    { name: "Sarah", role: "Admin", handle: "@sarah" },
    { name: "Du", role: "Crew", handle: "@ich" },
  ],
  aufbau: [
    { name: "Sarah", role: "Admin", handle: "@sarah" },
    { name: "Lena", role: "Teamleitung", handle: "@lena" },
    { name: "Du", role: "Crew", handle: "@ich" },
  ],
  max: [
    { name: "Max T.", role: "Crew", handle: "@max" },
    { name: "Du", role: "Crew", handle: "@ich" },
  ],
};

export default function Messenger() {
  const { user, demo } = useAuth();
  const [convs, setConvs] = useState<any[]>(demoConvs);
  const [active, setActive] = useState<any>(demoConvs[0]);
  const [msgs, setMsgs] = useState<any[]>(demoMsgs.technik);
  const [q, setQ] = useState("");
  const [text, setText] = useState("");
  const [reply, setReply] = useState<any>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);

  const bottom = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (demo || !user) return;
    listMessengerConversations(user.id).then(({ data }) => {
      const c = (data || []).map((x: any) => ({
        ...x.KT_conversations,
        name: x.KT_conversations?.title || x.KT_conversations?.name || "Direktnachricht",
        title: x.KT_conversations?.title || x.KT_conversations?.name || "Direktnachricht",
        last_read_at: x.last_read_at,
      }));
      setConvs(c);
      if (c[0]) setActive(c[0]);
    });
  }, [demo, user?.id]);

  useEffect(() => {
    if (!active) return;
    if (demo) {
      setMsgs(demoMsgs[active.id] || []);
      return;
    }
    listMessengerMessages(active.id).then(({ data }) => setMsgs(data || []));
    if (user) markConversationRead(active.id, user.id);
    return subscribeMessenger(active.id, (m) =>
      setMsgs((v) => (v.some((x) => x.id === m.id) ? v : [...v, m]))
    );
  }, [active?.id, demo, user?.id]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const nextHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 40), 120);
      textareaRef.current.style.height = `${nextHeight}px`;
    }
  }, [text]);

  useEffect(() => {
    if (!emojiOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (composerRef.current && !composerRef.current.contains(e.target as Node)) {
        setEmojiOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [emojiOpen]);

  const shown = useMemo(
    () => convs.filter((c) => (c.title || c.name || "Direktnachricht").toLowerCase().includes(q.toLowerCase())),
    [convs, q]
  );

  const send = async () => {
    const body = text.trim();
    if (!body || !active) return;
    setEmojiOpen(false);
    if (demo) {
      setMsgs((v) => [
        ...v,
        {
          id: crypto.randomUUID(),
          sender_id: "me",
          body,
          created_at: new Date().toISOString(),
          KT_profiles: { display_name: "Du" },
          KT_message_reactions: [],
          KT_message_attachments: [],
          reply_to: reply?.id,
        },
      ]);
      setText("");
      setReply(null);
      return;
    }
    if (user) {
      await sendMessengerMessage(active.id, user.id, body, reply?.id);
      setText("");
      setReply(null);
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !active) return;
    const previewUrl = URL.createObjectURL(file);
    const attachment = {
      id: crypto.randomUUID(),
      file_name: file.name,
      mime_type: file.type || "image/jpeg",
      size_bytes: file.size,
      previewUrl,
    };

    if (demo) {
      setMsgs((v) => [
        ...v,
        {
          id: crypto.randomUUID(),
          sender_id: "me",
          body: text.trim() || `📷 Foto: ${file.name}`,
          created_at: new Date().toISOString(),
          KT_profiles: { display_name: "Du" },
          KT_message_reactions: [],
          KT_message_attachments: [attachment],
        },
      ]);
      setText("");
    } else if (user) {
      const { path, error } = await uploadCrewFile(file, `chat/${active.id}`);
      if (error) {
        alert("Upload-Fehler: " + error.message);
      } else {
        const { data: m } = await sendMessengerMessage(
          active.id,
          user.id,
          text.trim() || `📷 Foto: ${file.name}`
        );
        if (m) {
          await addMessageAttachment(m.id, file.name, path, file.type, file.size);
          listMessengerMessages(active.id).then(({ data }) => setMsgs(data || []));
        }
      }
      setText("");
    }
    e.target.value = "";
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !active) return;
    const attachment = {
      id: crypto.randomUUID(),
      file_name: file.name,
      mime_type: file.type || "application/octet-stream",
      size_bytes: file.size,
    };

    if (demo) {
      setMsgs((v) => [
        ...v,
        {
          id: crypto.randomUUID(),
          sender_id: "me",
          body: text.trim() || `📎 Datei: ${file.name}`,
          created_at: new Date().toISOString(),
          KT_profiles: { display_name: "Du" },
          KT_message_reactions: [],
          KT_message_attachments: [attachment],
        },
      ]);
      setText("");
    } else if (user) {
      const { path, error } = await uploadCrewFile(file, `chat/${active.id}`);
      if (error) {
        alert("Upload-Fehler: " + error.message);
      } else {
        const { data: m } = await sendMessengerMessage(
          active.id,
          user.id,
          text.trim() || `📎 Datei: ${file.name}`
        );
        if (m) {
          await addMessageAttachment(m.id, file.name, path, file.type, file.size);
          listMessengerMessages(active.id).then(({ data }) => setMsgs(data || []));
        }
      }
      setText("");
    }
    e.target.value = "";
  };

  const handleDownloadAttachment = async (a: any) => {
    if (a.previewUrl) {
      window.open(a.previewUrl, "_blank");
      return;
    }
    if (a.storage_path) {
      const { data } = await signedCrewUrl(a.storage_path);
      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank", "noopener,noreferrer");
      }
    }
  };

  const react = async (m: any, emoji: string) => {
    if (demo) {
      setMsgs((v) =>
        v.map((x) =>
          x.id === m.id
            ? {
                ...x,
                KT_message_reactions: [
                  ...(x.KT_message_reactions || []),
                  { id: crypto.randomUUID(), emoji },
                ],
              }
            : x
        )
      );
      return;
    }
    if (user) await reactMessage(m.id, user.id, emoji);
  };

  const activeAttachments = useMemo(
    () => msgs.flatMap((m) => m.KT_message_attachments || []),
    [msgs]
  );

  const activeParticipants = demoParticipants[active?.id] || [
    { name: active?.name || "Crew Mitglied", role: "Crew", handle: "@crew" },
    { name: "Du", role: "Crew", handle: "@ich" },
  ];

  return (
    <section className="messengerShell glass">
      {/* Hidden file inputs */}
      <input ref={photoInputRef} type="file" accept="image/*" hidden onChange={handlePhotoSelect} />
      <input ref={fileInputRef} type="file" hidden onChange={handleFileSelect} />

      <aside className={`conversationPane ${active ? "mobileHidden" : ""}`}>
        <header>
          <div>
            <span className="eyebrow">MESSENGER</span>
            <h2>Chats</h2>
          </div>
          <MessageCircle />
        </header>
        <label className="msgSearch">
          <Search />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chats suchen…" />
        </label>
        <div className="conversationList">
          {shown.map((c) => (
            <button
              key={c.id}
              className={active?.id === c.id ? "active" : ""}
              onClick={() => setActive(c)}
            >
              <span className="convAvatar">{c.type === "group" ? <Users /> : (c.name || "D")[0]}</span>
              <span>
                <b>{c.name || "Direktnachricht"}</b>
                <small>{c.preview || "Unterhaltung öffnen"}</small>
              </span>
              {c.unread > 0 && <i>{c.unread}</i>}
            </button>
          ))}
        </div>
      </aside>

      <main className={`chatPane ${!active ? "mobileHidden" : ""}`}>
        {active && (
          <>
            <header className="chatHeader">
              <button className="chatBack" onClick={() => setActive(null)}>
                <ArrowLeft />
              </button>
              <div className="convAvatar">{active.type === "group" ? <Users /> : (active.name || "D")[0]}</div>
              <div>
                <b>{active.name || "Direktnachricht"}</b>
                <small>
                  {active.type === "group" ? "Crew-Gruppe" : "Direktnachricht"}
                  {muted && " · 🔕 Stumm"}
                </small>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
                <button
                  className="chatSettingsBtn"
                  title="Chat-Einstellungen"
                  onClick={() => setSettingsOpen(true)}
                >
                  <SlidersHorizontal size={18} />
                </button>
              </div>
            </header>

            <div className="messageStream">
              {msgs.map((m) => {
                const mine = demo ? m.sender_id === "me" : m.sender_id === user?.id;
                return (
                  <div className={`messageLine ${mine ? "mine" : ""}`} key={m.id}>
                    <div className="messageBubble">
                      {!mine && <b>{m.KT_profiles?.display_name || m.KT_profiles?.username || "Crew"}</b>}
                      <p>{m.body}</p>

                      {/* Attachments rendering */}
                      {m.KT_message_attachments?.map((a: any) => {
                        const isImg =
                          a.mime_type?.startsWith("image/") ||
                          /\.(png|jpe?g|webp|gif)$/i.test(a.file_name);
                        const imgSrc = a.previewUrl || a.storage_path;

                        if (isImg && imgSrc) {
                          return (
                            <div key={a.id} className="chatImgWrapper">
                              <img
                                src={imgSrc}
                                alt={a.file_name}
                                className="chatImgPreview"
                                onClick={() => window.open(imgSrc, "_blank")}
                              />
                            </div>
                          );
                        }

                        return (
                          <span
                            className="messageAttachment"
                            key={a.id}
                            onClick={() => handleDownloadAttachment(a)}
                            style={{ cursor: "pointer" }}
                            title="Herunterladen"
                          >
                            <Paperclip size={13} />
                            <span>{a.file_name}</span>
                            {a.size_bytes && (
                              <small style={{ color: "#778593" }}>
                                ({Math.max(1, Math.round(a.size_bytes / 1024))} KB)
                              </small>
                            )}
                            <Download size={13} style={{ marginLeft: "auto" }} />
                          </span>
                        );
                      })}

                      <time>
                        {new Date(m.created_at).toLocaleTimeString("de-DE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>

                      <div className="reactionBar">
                        {Array.from(
                          new Set((m.KT_message_reactions || []).map((r: any) => r.emoji))
                        ).map((e: any) => (
                          <span key={e}>
                            {e}{" "}
                            {
                              (m.KT_message_reactions || []).filter((r: any) => r.emoji === e).length
                            }
                          </span>
                        ))}
                      </div>

                      <div className="messageActions">
                        <button onClick={() => setReply(m)}>
                          <Reply />
                        </button>
                        {["👍", "❤️", "🔥"].map((e) => (
                          <button key={e} onClick={() => react(m, e)}>
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottom} />
            </div>

            {reply && (
              <div className="replyPreview">
                <Reply />
                <span>
                  <b>Antwort an {reply.KT_profiles?.display_name || "Crew"}</b>
                  {reply.body}
                </span>
                <button onClick={() => setReply(null)}>×</button>
              </div>
            )}

            <div className="messageComposer" ref={composerRef}>
              {emojiOpen && (
                <div className="emojiPickerPopover">
                  <div className="emojiGrid">
                    {["👍", "❤️", "🔥", "😂", "🎉", "🙌", "✨", "🚀", "😎", "🥳", "🙏", "💯", "👋", "👀", "✅", "💬"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setText((prev) => prev + emoji);
                          textareaRef.current?.focus();
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button
                type="button"
                className="composerActionBtn"
                title="Datei senden"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={18} />
              </button>
              <textarea
                ref={textareaRef}
                rows={1}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Nachricht schreiben… @Crew"
              />
              <button
                type="button"
                className={`composerActionBtn ${emojiOpen ? "active" : ""}`}
                title="Emoji"
                onClick={() => setEmojiOpen((v) => !v)}
              >
                <Smile size={18} />
              </button>
              <button
                type="button"
                className="sendBtn"
                onClick={send}
                disabled={!text.trim()}
                title="Senden"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        )}
      </main>

      {/* Chat-Einstellungen Modal */}
      {settingsOpen && active && (
        <div className="modalback">
          <div className="modal glass" style={{ maxWidth: "480px" }}>
            <button className="close" onClick={() => setSettingsOpen(false)}>
              <X />
            </button>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
              <div className="convAvatar" style={{ width: "46px", height: "46px" }}>
                {active.type === "group" ? <Users /> : (active.name || "D")[0]}
              </div>
              <div>
                <h2 style={{ margin: 0 }}>{active.name || "Direktnachricht"}</h2>
                <small style={{ color: "#8a96a3" }}>
                  {active.type === "group" ? "Gruppen-Kanal" : "Direktunterhaltung"}
                </small>
              </div>
            </div>

            <div style={{ display: "grid", gap: "14px" }}>
              {/* Benachrichtigungen */}
              <div
                className="glass"
                style={{
                  padding: "12px 14px",
                  borderRadius: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", gap: "9px", alignItems: "center" }}>
                  {muted ? <BellOff size={18} color="#ff7b8b" /> : <Bell size={18} color="#6ce3a8" />}
                  <span>{muted ? "Benachrichtigungen stumm" : "Benachrichtigungen aktiv"}</span>
                </div>
                <button
                  className={`statusbtn ${!muted ? "on" : ""}`}
                  onClick={() => setMuted(!muted)}
                  style={{ padding: "6px 12px", borderRadius: "999px" }}
                >
                  {muted ? "Stumm" : "Aktiv"}
                </button>
              </div>

              {/* Teilnehmer */}
              <div>
                <b style={{ display: "block", fontSize: "13px", color: "#8a96a3", marginBottom: "8px" }}>
                  Teilnehmer ({activeParticipants.length})
                </b>
                <div className="glass" style={{ borderRadius: "12px", overflow: "hidden" }}>
                  {activeParticipants.map((p, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 14px",
                        borderBottom:
                          i < activeParticipants.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                      }}
                    >
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <i className="mini" style={{ width: "28px", height: "28px", fontSize: "12px" }}>
                          {p.name[0]}
                        </i>
                        <span>
                          <b>{p.name}</b> <small style={{ color: "#75828f" }}>{p.handle}</small>
                        </span>
                      </div>
                      <span
                        className={p.role === "Teamleitung" ? "secondary" : "roleBadge"}
                        style={
                          p.role === "Teamleitung"
                            ? undefined
                            : {
                                fontSize: "11px",
                                padding: "3px 8px",
                                borderRadius: "999px",
                                background: "rgba(125,91,255,0.14)",
                                color: "#bbaeff",
                              }
                        }
                      >
                        <Shield size={11} style={{ verticalAlign: "middle", marginRight: "3px" }} />
                        {p.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geteilte Medien */}
              <div>
                <b style={{ display: "block", fontSize: "13px", color: "#8a96a3", marginBottom: "8px" }}>
                  Geteilte Dateien ({activeAttachments.length})
                </b>
                <div
                  className="glass"
                  style={{
                    borderRadius: "12px",
                    padding: "10px 14px",
                    maxHeight: "130px",
                    overflow: "auto",
                    display: "grid",
                    gap: "6px",
                  }}
                >
                  {activeAttachments.length === 0 ? (
                    <small style={{ color: "#778593" }}>Noch keine geteilten Dateien im Chat.</small>
                  ) : (
                    activeAttachments.map((att: any, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "12px",
                        }}
                      >
                        <span style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <Paperclip size={13} color="#8a96a3" />
                          {att.file_name}
                        </span>
                        <button
                          onClick={() => handleDownloadAttachment(att)}
                          style={{ border: 0, background: "transparent", color: "#8be7bc", cursor: "pointer" }}
                        >
                          <Download size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Aktionen */}
              <button
                className="secondary"
                style={{
                  display: "flex",
                  gap: "7px",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: "8px",
                  color: "#ff7b8b",
                  borderColor: "rgba(255,100,120,0.2)",
                }}
                onClick={() => {
                  if (confirm("Möchtest du den Verlauf leeren?")) {
                    setMsgs([]);
                    setSettingsOpen(false);
                  }
                }}
              >
                <Trash2 size={15} /> Chat-Verlauf leeren
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
