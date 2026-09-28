"use client";

import { Wordmark } from "@/components/brand";
import { Ornament } from "@/components/ornament";
import { useSeller } from "@/components/seller-provider";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginView() {
  const { t } = useSeller();
  const router = useRouter();
  const [phone, setPhone] = useState("+998 90 777 10 10");
  const [password, setPassword] = useState("••••••••");

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-tawfiq-800 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Ornament className="pointer-events-none absolute inset-0 text-white opacity-[0.1]" />
        <div className="relative">
          <Wordmark light seller={t.brand.seller} />
        </div>
        <div className="relative max-w-md">
          <p className="text-xs tracking-[0.18em] text-white/70">{t.login.kicker}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">{t.login.title}</h1>
          <p className="mt-4 text-white/75">{t.login.text}</p>
        </div>
        <p className="relative text-sm text-white/50">Tashkent · UZS</p>
      </section>
      <section className="relative flex items-center justify-center bg-canvas px-4 py-10">
        <Ornament className="pointer-events-none absolute inset-0 text-tawfiq-800 opacity-[0.04] lg:hidden" />
        <div className="relative w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-card">
          <div className="mb-6 lg:hidden"><Wordmark seller={t.brand.seller} /></div>
          <h2 className="text-xl font-semibold">{t.login.submit}</h2>
          <form className="mt-5 space-y-3" onSubmit={(event) => { event.preventDefault(); router.push("/"); }}>
            <Field label={t.login.phone}><Input value={phone} onChange={(event) => setPhone(event.target.value)} /></Field>
            <Field label={t.login.password}><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></Field>
            <Button type="submit" className="w-full">{t.login.submit}</Button>
          </form>
          <Button variant="secondary" className="mt-2 w-full" onClick={() => router.push("/")}>{t.login.demo}</Button>
          <p className="mt-4 text-xs leading-relaxed text-muted">{t.login.note}</p>
        </div>
      </section>
    </div>
  );
}
