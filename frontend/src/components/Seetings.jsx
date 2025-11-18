import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserEdit,
  FaPlusCircle,
  FaBell,
  FaMapMarkerAlt,
  FaQuestionCircle,
  FaFileAlt,
  FaLock,
  FaListAlt,
  FaPalette,
} from "react-icons/fa";
import "../styles/Settings.css";


export default function SettingsPanel() {
  const [notifications, setNotifications] = useState(true);
  const navigate = useNavigate();

  const handleItemClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  const sections = [
    {
      title: "Conta",
      items: [
        { 
          icon: <FaUserEdit />, 
          label: "Editar Perfil",
          description: "Atualize suas informações pessoais e foto de perfil",
          path: "/profile"
        },
        { 
          icon: <FaPlusCircle />, 
          label: "Adicionar Item",
          description: "Cadastre novos itens para compartilhar",
          path: "/create-item"
        },
        { 
          icon: <FaListAlt />, 
          label: "Meus Itens",
          description: "Veja e gerencie seus anúncios ativos",
          path: "/my-items"
        },
      ],
    },
    {
      title: "Preferências",
      items: [
        { 
          icon: <FaBell />, 
          label: "Notificações", 
          type: "toggle",
          description: "Receba atualizações sobre suas trocas e doações"
        },
        { 
          icon: <FaMapMarkerAlt />, 
          label: "Localização",
          description: "Configure sua localização para encontrar itens próximos"
        },
        { 
          icon: <FaPalette />, 
          label: "Aparência",
          description: "Personalize a exibição e o tema da plataforma"
        },
      ],
    },
    {
      title: "Sobre",
      items: [
        { 
          icon: <FaQuestionCircle />, 
          label: "Ajuda e Suporte",
          description: "Tire suas dúvidas e fale conosco"
        },
        { 
          icon: <FaFileAlt />, 
          label: "Termos de Uso",
          description: "Leia os termos e condições da plataforma"
        },
        { 
          icon: <FaLock />, 
          label: "Política de Privacidade",
          description: "Como protegemos seus dados pessoais"
        },
      ],
    },
  ];

  return (
    <div className="settings-panel">
      <div className="settings-grid">
        {sections.map((section) => (
          <div key={section.title} className="settings-column">
            <h3 className="column-title">{section.title}</h3>
            <div className="settings-items">
              {section.items.map((item) => (
                <div 
                  key={item.label} 
                  className="settings-item"
                  onClick={() => handleItemClick(item.path)}
                >
                  <div className="item-left">
                    <div className="icon">{item.icon}</div>
                    <div className="item-content">
                      <div className="item-title">{item.label}</div>
                      <div className="item-description">{item.description}</div>
                    </div>
                  </div>
                  <div className="item-right">
                    {item.type === "toggle" ? (
                      <label className="switch" onClick={(e) => e.stopPropagation()}>
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
      </div>

      <div className="settings-footer">
        <button className="logout-btn" onClick={() => navigate("/logout")}>
          Sair da Conta
        </button>
      </div>
    </div>
  );
}
