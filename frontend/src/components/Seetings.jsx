import React, { useState } from "react";
import {
  FaUserEdit,
  FaShieldAlt,
  FaPlusCircle,
  FaBell,
  FaMapMarkerAlt,
  FaQuestionCircle,
  FaFileAlt,
  FaLock,
  FaListAlt,
  FaHeart,
} from "react-icons/fa";
import "../styles/Settings.css";


export default function SettingsPanel() {
  const [notifications, setNotifications] = useState(true);

  const sections = [
    {
      title: "Account",
      items: [
        { icon: <FaUserEdit />, label: "Editar Perfil" },
        { icon: <FaShieldAlt />, label: "Segurança da Conta" },
  { icon: <FaPlusCircle />, label: "Adicionar Item para venda/Doação" },
  { icon: <FaListAlt />, label: "Meus Itens" },
  { icon: <FaHeart />, label: "Favoritos" },

      ],
    },
    {
      title: "Preferences",
      items: [
        { icon: <FaBell />, label: "Notificações", type: "toggle" },
        { icon: <FaMapMarkerAlt />, label: "Localização" },
      ],
    },
    {
      title: "About give.me",
      items: [
        { icon: <FaQuestionCircle />, label: "Ajuda e Suporte" },
        { icon: <FaFileAlt />, label: "Termos de Uso" },
        { icon: <FaLock />, label: "Política de Privacidade" },
      ],
    },
  ];

  return (
    <div className="settings-panel">
      {sections.map((section) => (
        <div key={section.title} className="settings-section">
          <h3>{section.title.toUpperCase()}</h3>
          <div className="settings-items">
            {section.items.map((item) => (
              <div key={item.label} className="settings-item">
                <div className="item-left">
                  <div className="icon">{item.icon}</div>
                  <span>{item.label}</span>
                </div>
                <div className="item-right">
                  {item.type === "toggle" ? (
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notifications}
                        onChange={() => setNotifications(!notifications)}
                      />
                      <span className="slider round"></span>
                    </label>
                  ) : (
                    <span className="arrow">›</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button className="logout-btn">Log Out</button>
    </div>
  );
}
