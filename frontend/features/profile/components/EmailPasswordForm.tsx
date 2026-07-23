"use client";

import { useState } from "react";
import axios from "axios";
import { profileApi } from "@/features/profile/api/profileAPI";
import { useAuth } from "@/context/AuthContext";
import { TextInput } from "@/features/auth/components/TextInput";
import { Button } from "@/components/ui/button";

export function EmailPasswordForm() {
  const { user, refetch } = useAuth();

  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(false);

    if (!email || !currentPasswordForEmail) {
      setEmailError("Email et mot de passe requis");
      return;
    }

    setEmailLoading(true);
    try {
      await profileApi.updateEmail(email, currentPasswordForEmail);
      setEmailSuccess(true);
      setCurrentPasswordForEmail("");
      await refetch();
    } catch (err) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setEmailError(err.response?.data.message ?? "Erreur lors de la mise à jour");
      } else {
        setEmailError("Erreur lors de la mise à jour");
      }
    } finally {
      setEmailLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword) {
      setPasswordError("Tous les champs sont requis");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Le nouveau mot de passe doit contenir au moins 6 caractères");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }

    setPasswordLoading(true);
    try {
      await profileApi.updatePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setPasswordError(err.response?.data.message ?? "Erreur lors de la mise à jour");
      } else {
        setPasswordError("Erreur lors de la mise à jour");
      }
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-md">
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <h3 className="text-base font-semibold text-brand-navy">Adresse email</h3>
        <div>
          <TextInput
            type="email"
            label="Nouvel Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <TextInput
            type="password"
            label="Mot de passe actuel"
            value={currentPasswordForEmail}
            onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        {emailError && <p className="text-sm text-red-600">{emailError}</p>}
        {emailSuccess && (
          <p className="text-sm text-green-600">Email mis à jour avec succès</p>
        )}
        <Button
          type="submit"
          variant={"default"}
          disabled={emailLoading}
          className={"bg-gradient-brand"}
        >
          {emailLoading ? "Mise à jour..." : "Mettre à jour l'email"}
        </Button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="space-y-4 border-t pt-6">
        <h3 className="text-base font-semibold text-brand-navy">Mot de passe</h3>
        <div>
          <TextInput
            type="password"
            label="Mot de passe actuel"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <TextInput
            type="password"
            label="Nouveau Mot de passe"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <TextInput
            type="password"
            label=" Confirmer le nouveau mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
        {passwordSuccess && (
          <p className="text-sm text-green-600">Mot de passe mis à jour avec succès</p>
        )}
        <Button
          type="submit"
          variant={"default"}
          disabled={passwordLoading}
          className={"bg-gradient-brand"}
        >
          {passwordLoading ? "Mise à jour..." : "Changer le mot de passe"}
        </Button>
      </form>
    </div>
  );
}