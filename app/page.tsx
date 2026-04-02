import AppSidebar from "@/components/sidebar";

export default function Home() {
  return (
    <main
      className="h-screen w-screen overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(10,10,10,0.75), rgba(10,10,10,0.75)), url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80')",
      }}
    >
      <AppSidebar />
    </main>
  );
}
