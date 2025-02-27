import DogDetails from "pages/DogDetails";
import ProviderPage from "pages/ProviderPage";
import WatchingDogs from "pages/WatchingDogs";
import ErrorPage from "pages/ErrorPage";
import { BrowserRouter, Routes, Route } from "react-router";
import WatchingOwners from "pages/WatchingOwners";
import OwnerDetails from "pages/OwnerDetails";

export default function AppRoutes() {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<ProviderPage />}>
                <Route index element={<WatchingDogs />} />
                <Route path="owners" element={<WatchingOwners />}>
                  <Route path="view/:id" element={<OwnerDetails />} />
                </Route>
                <Route path="dogdetails/:id" element={<DogDetails />} />
                <Route path="agenda" element={<div></div>} />
                <Route path="*" element={<ErrorPage locationTo="/" buttonText="Ir para página inicial" title="Página ainda em desenvolvimento"/>} />
            </Route>
        </Routes>
    </BrowserRouter>
  )
}
