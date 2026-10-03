'use client'

// آخرین لایه خطا: وقتی خود قالب سایت (هدر/فوتر) هم بالا نیاید. باید html و body خودش را داشته باشد.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fa" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fbf8f7',
          color: '#21151a',
          fontFamily: 'Tahoma, sans-serif',
          textAlign: 'center',
          padding: '1.5rem',
        }}
      >
        <main>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 500 }}>مشکلی پیش آمد</h1>
          <p style={{ margin: '0.75rem auto 0', maxWidth: '20rem', color: '#6e5d64', lineHeight: 1.9 }}>
            بخشی از سایت در حال حاضر درست کار نمی‌کند. چند لحظه دیگر دوباره تلاش کنید.
          </p>
          <div style={{ marginTop: '1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <button
              type="button"
              onClick={reset}
              style={{
                minHeight: '2.875rem',
                padding: '0 1.75rem',
                border: 0,
                borderRadius: '0.25rem',
                background: '#8e2a4a',
                color: '#fff',
                font: 'inherit',
                cursor: 'pointer',
              }}
            >
              تلاش دوباره
            </button>
            {/* لینک ساده HTML عمداً؛ در این حالت مسیریابی Next ممکن است سالم نباشد */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" style={{ color: '#21151a', borderBottom: '1px solid #c4a47c', textDecoration: 'none', paddingBottom: 2 }}>
              بازگشت به صفحه اصلی
            </a>
          </div>
        </main>
      </body>
    </html>
  )
}
