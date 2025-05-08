import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';
import { subscribeToNewsletter } from "../lib/newsletter/newsletter";
import toast from "react-hot-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const result = await subscribeToNewsletter(email);

    if (result.success) {
      setStatus("success");
      setEmail("");
      toast.success("Subscribed successfully!");
      setTimeout(() => setStatus("idle"), 3000);
    } else {
      setStatus("error");
      setErrorMsg(result.message || "Failed to subscribe");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-transparent to-black/20">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass p-8 md:p-12 rounded-2xl text-center"
        >
          <Mail className="w-12 h-12 mx-auto mb-6 text-purple-400" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join the Inner Circle
          </h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Subscribe to receive exclusive offers, early access to new products,
            and invitations to members-only events.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/10 rounded-lg border border-white/20 
                focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="button-primary !px-6"
              >
                {status === "loading" ? (
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : status === "success" ? (
                  "Subscribed!"
                ) : (
                  <ArrowRight className="w-6 h-6" />
                )}
              </button>
            </div>
            {status === "error" && (
              <p className="text-red-400 text-sm mt-2">{errorMsg}</p>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
