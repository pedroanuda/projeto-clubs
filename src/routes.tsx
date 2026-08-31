import { BrowserRouter, Routes, Route } from 'react-router';
import {
  Configs,
  DogDetails,
  Help,
  OwnerDetails,
  WatchingDogs,
  WatchingOwners,
  ProviderPage,
  ErrorPage,
} from 'pages';

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
          <Route path="help" element={<Help />} />
          <Route
            path="*"
            element={
              <ErrorPage
                locationTo="/"
                buttonText="Ir para página inicial"
                title="Página ainda em desenvolvimento"
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
