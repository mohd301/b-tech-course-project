import Header from "../components/shared/Header"
import Footer from "../components/shared/Footer"

export default function AuthLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-muted/30 py-8 px-4">
        {children}
      </main>
      <Footer />
    </div>
  )
}
