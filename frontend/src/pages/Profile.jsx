import React from "react";
import { Link } from "react-router-dom";
import "../styles/Profile.css";
import { BackHeader, Navbar } from "../components/Base";
import SettingsPanel from "../components/Seetings";

export default function Profile() {
  return (
    <div className="profile-page">
      <Navbar activePage="profile" />
      <div className="profile-avatar">
        <div className="avatar-img" />
      </div>
      <h3 className="profile-name">Maria Silva</h3>
      <div className="profile-joined">Entrou em Março de 2024</div>
      <div className="profile-summary">12 Doações Concluídas · 25 Avaliações</div>

      {/* Integrate settings panel here — buttons will use styles from Settings.css */}
      <section className="profile-settings-section">
        <SettingsPanel />
      </section>
    </div>
  );
}
