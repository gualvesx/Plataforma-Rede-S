import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';

export function RegisterPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'professor', unit: 'FabLab SP' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const setF = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setError('');
    setSaving(true);

    // Insert a pending user record so admin can activate and set password
    const { error: err } = await supabase.from('users').insert({
      name: form.name,
      email: form.email,
      role: form.role,
      unit: form.unit,
      active: false, // admin must activate
    });

    setSaving(false);
    if (err) {
      setError('Erro ao enviar solicitação. Tente novamente.');
    } else {
      setSent(true);
    }
  };

  const cardClass = "bg-white dark:bg-[#1e2130] backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4";
  const bgStyle = { background: 'linear-gradient(135deg, #1a1a1a 0%, #2d0000 50%, #1a1a1a 100%)' };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={bgStyle}>
        <div className={cardClass}>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm mb-4">
            <CheckCircle size={18} />
            {t('auth.successMessage')}
          </div>
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-semibold hover:underline"
            style={{ color: 'var(--fab-primary)' }}
          >
            ← {t('auth.backToLogin')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={bgStyle}>
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white dark:bg-[#1e2130] backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10">
          <h1 className="text-xl font-bold mb-1 text-gray-900 dark:text-gray-100">{t('auth.registerTitle')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{t('auth.registerSubtitle')}</p>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('auth.nameLabel')}</Label>
              <Input value={form.name} onChange={(e) => setF('name', e.target.value)} placeholder={t('auth.namePlaceholder')} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('auth.emailLabel')}</Label>
              <Input type="email" value={form.email} onChange={(e) => setF('email', e.target.value)} placeholder={t('auth.emailPlaceholder')} className="h-10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('auth.roleLabel')}</Label>
                <select
                  value={form.role}
                  onChange={(e) => setF('role', e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="professor">{t('roles.professor')}</option>
                  <option value="funcionario">{t('roles.funcionario')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('auth.unitLabel')}</Label>
                <Input value={form.unit} onChange={(e) => setF('unit', e.target.value)} placeholder={t('auth.unitPlaceholder')} className="h-10" />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold text-white mt-2"
              disabled={saving}
              style={{ background: 'var(--fab-primary)' }}
            >
              {saving ? t('auth.registering') : t('auth.registerButton')}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            <button onClick={() => navigate('/login')} className="font-semibold hover:underline" style={{ color: 'var(--fab-primary)' }}>
              ← {t('auth.backToLogin')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
