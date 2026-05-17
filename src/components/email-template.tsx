interface EmailTemplateProps {
  name: string;
  actionUrl: string;
  planName?: string;
  /** When provided (MPpsc dynamic funnel), replaces the hero title. */
  headerLine1?: string;
  headerSubtitle?: string;
  /** Replaces default welcome paragraphs — full sentence(s). */
  welcomeLead?: string;
  /** Feature table rows — may already include ✅ prefix. */
  featureRows?: string[];
}

export default function EmailTemplate({
  name,
  actionUrl,
  planName = 'Premium',
  headerLine1,
  headerSubtitle,
  welcomeLead,
  featureRows,
}: EmailTemplateProps) {
  const h1 = headerLine1 ?? 'MPPSC Prelims - 2026';
  const sub = headerSubtitle ?? 'Smart Test Series';
  const features =
    featureRows && featureRows.length > 0
      ? featureRows
      : [
          '✅ Topic-wise & Unit-wise Tests',
          '✅ Full Length Mock Tests (100 Questions)',
          '✅ PYQ Papers with Smart Explanations',
          '✅ Bilingual — Hindi & English',
          '✅ Performance Analytics Dashboard',
        ];

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        lineHeight: '1.6',
        color: '#1a1a1a',
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Header with brand gradient */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
          padding: '32px 24px',
          textAlign: 'center',
          borderRadius: '12px 12px 0 0',
        }}
      >
        <h1
          style={{
            color: '#ffffff',
            fontSize: '22px',
            fontWeight: '700',
            margin: '0 0 4px 0',
            letterSpacing: '-0.5px',
          }}
        >
          {h1}
        </h1>
        <p
          style={{
            color: '#00F0FF',
            fontSize: '12px',
            fontWeight: '600',
            margin: '0',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          {sub}
        </p>
      </div>

      {/* Main content */}
      <div style={{ padding: '32px 24px', border: '1px solid #e5e7eb', borderTop: 'none' }}>
        {/* Congratulations badge */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
              color: '#059669',
              fontSize: '13px',
              fontWeight: '700',
              padding: '6px 16px',
              borderRadius: '20px',
              border: '1px solid #a7f3d0',
            }}
          >
            🎉 Congratulations!
          </span>
        </div>

        <p style={{ fontSize: '16px', marginBottom: '8px', fontWeight: '600' }}>Hi {name},</p>

        {welcomeLead ? (
          <p style={{ fontSize: '15px', marginBottom: '24px', color: '#374151' }}>{welcomeLead}</p>
        ) : (
          <>
            <p style={{ fontSize: '15px', marginBottom: '16px', color: '#374151' }}>
              Welcome aboard! Your <strong style={{ color: '#0a0a0a' }}>{planName}</strong> plan is
              activated. You&apos;ve taken the first step towards cracking MPPSC — and that takes
              courage. 💪
            </p>

            <p style={{ fontSize: '15px', marginBottom: '24px', color: '#374151' }}>
              Set your password below to unlock your full access — topic-wise tests, full-length
              mocks, PYQ papers, smart analytics, and everything you need to succeed.
            </p>
          </>
        )}

        {/* CTA Button */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <a
            href={actionUrl}
            style={{
              display: 'inline-block',
              padding: '14px 36px',
              background: 'linear-gradient(135deg, #0a0a0a, #1a1a2e)',
              color: '#00F0FF',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '15px',
              letterSpacing: '0.5px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            }}
          >
            Set Your Password →
          </a>
        </div>

        {/* Motivation box */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            borderLeft: '4px solid #00F0FF',
          }}
        >
          <p style={{ fontSize: '14px', color: '#475569', margin: '0', fontStyle: 'italic' }}>
            &quot;सफलता उन्हीं को मिलती है जो मेहनत करते हैं।&quot; — Your MPPSC journey starts now.
            Consistent practice is the key. We&apos;re here to help you every step of the way.
          </p>
        </div>

        {/* What you get */}
        <div style={{ marginBottom: '20px' }}>
          <p
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#0a0a0a',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            What&apos;s waiting for you:
          </p>
          <table style={{ width: '100%', fontSize: '14px', color: '#4b5563' }}>
            <tbody>
              {features.map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '4px 0' }}>{row}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Token expiry warning */}
        <div
          style={{
            background: '#fef3c7',
            borderRadius: '6px',
            padding: '10px 14px',
            marginBottom: '20px',
          }}
        >
          <p style={{ fontSize: '13px', color: '#92400e', margin: '0', fontWeight: '500' }}>
            ⏰ This link expires in <strong>1 hour</strong>. Set your password now to avoid requesting
            a new one.
          </p>
        </div>

        <p style={{ fontSize: '13px', color: '#9ca3af' }}>
          If you didn&apos;t make this purchase, please ignore this email. No action is needed.
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          background: '#f9fafb',
          padding: '20px 24px',
          textAlign: 'center',
          borderRadius: '0 0 12px 12px',
          border: '1px solid #e5e7eb',
          borderTop: 'none',
        }}
      >
        <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: '600' }}>
          Mindful MPPSC — Smart Test Series
        </p>
        <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0' }}>
          Secure • Trusted • Built for MPPSC Aspirants
        </p>
      </div>
    </div>
  );
}
