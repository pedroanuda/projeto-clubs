import DogDetails from "pages/DogDetails";
import ProviderPage from "pages/ProviderPage";
import WatchingDogs from "pages/WatchingDogs";
import ErrorPage from "pages/ErrorPage";
import { BrowserRouter, Routes, Route } from "react-router";
import WatchingOwners from "pages/Owners/WatchingOwners";
import OwnerDetails from "pages/Owners/OwnerDetails";
import Configs from "pages/Configs";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProviderPage />}>
          <Route index element={<WatchingDogs />} />
          <Route path="owners" element={<WatchingOwners />}>
            <Route path="view/:id" element={<OwnerDetails />} />
            <Route path="create" element={<OwnerDetails createMode={true} />} />
          </Route>
          <Route path="dogdetails/:id" element={<DogDetails />} />
          <Route path="settings" element={<Configs />} />
          <Route path="*" element={<ErrorPage locationTo="/" buttonText="Ir para página inicial" title="Página ainda em desenvolvimento"/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
