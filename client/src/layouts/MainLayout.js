import Header from "../components/shared/Header"
import Footer from "../components/shared/Footer"

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-muted/20 p-4 md:p-6">
        {children}
      </main>
      <Footer />
    </div>
  )
}
