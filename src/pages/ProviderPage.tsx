import Sidebar, { SecaoAttr } from "components/Sidebar";
import { Outlet } from "react-router-dom";
import { DogFoot, AgendaBook, StatisticsIcon } from "common/icons"
import AppBar from "components/AppBar";
import { DogsContextProvider } from "common/contexts/Dogs";

export default function ProviderPage() {
  const secoes: SecaoAttr[] = [
    {
      sectionName: "Todos os Cachorros",
      icon: DogFoot,
      link: "/"
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

  return (
    <DogsContextProvider>
    <AppBar />
    <Sidebar sections={secoes} titleBarHeight="40px"/>
    <main style={{marginLeft: "3.5rem", marginTop: "40px", boxSizing: "border-box", height: "calc(100vh - 40px)", overflowY: "scroll", overflowX: "hidden"}}>
        <Outlet />
    </main>
    </DogsContextProvider>
  )
}
