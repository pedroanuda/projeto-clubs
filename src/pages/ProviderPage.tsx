import Sidebar, { SecaoAttr } from "components/Sidebar";
import { Outlet } from "react-router";
import { DogFoot, AgendaBook, StatisticsIcon, PersonIcon } from "common/icons"
import AppBar from "components/AppBar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function ProviderPage() {
  const secoes: SecaoAttr[] = [
    {
      sectionName: "Cachorros",
      icon: DogFoot,
      link: "/"
    },
    {
      sectionName: "Donos",
      icon: PersonIcon,
      link: "/owners"
    },
    {
      sectionName: "Agenda",
      icon: AgendaBook,
      link: "/agenda"
    },
    {
      sectionName: "Estatísticas",
      icon: StatisticsIcon,
      link: "/estatisticas"
    }
  ]

  document.addEventListener("contextmenu", e => e.preventDefault());
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AppBar />
      <Sidebar sections={secoes} titleBarHeight="40px"/>
      <main style={{marginLeft: "3.5rem", marginTop: "40px", boxSizing: "border-box", height: "calc(100vh - 40px)",
        overflowX: "hidden", boxShadow: "0 0 3px 0 rgba(0, 0, 0, 0.2)", zIndex: 1, position: "relative",
        backgroundColor: "rgb(var(--md-sys-color-surface))", borderTopLeftRadius: "10px"
      }}>
          <Outlet />
      </main>
    </QueryClientProvider>
  )
}
