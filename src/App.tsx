import { useSelector } from 'react-redux';
import { Route, Routes, useLocation } from 'react-router-dom';

import { Searchbar, Sidebar, MusicPlayer, TopPlay } from './components';
import { ArtistDetails, AroundYou, Search, SongDetails } from './pages';
import SigninForm from './_auth/forms/SigninForm';
import AuthLayout from './_auth/AuthLayout';
import SignupForm from './_auth/forms/SignupForm';

const App = () => {
  const { activeSong } = useSelector((state) => state.player);
  const location = useLocation();

  // Determine if the current route is an authentication route.
  const isAuthRoute = location.pathname === '/sign-in' || location.pathname === '/sign-up';

  return (
    <>
      {/* Conditional rendering based on whether the route is an authentication route */}
      {!isAuthRoute && (
        <div className="relative flex">
          <Sidebar />
          <div className="flex-1 flex flex-col bg-neutral-900">
            <Searchbar />
            <div className="px-6 h-[calc(100vh-72px)] overflow-y-scroll hide-scrollbar flex xl:flex-row flex-col-reverse">
              <div className="flex-1 h-fit pb-40">
                <Routes>
                  {/* Your non-auth related routes */}
                  <Route path="/" element={<AroundYou />} />
                  <Route path="/artists/:id" element={<ArtistDetails />} />
                  <Route path="/songs/:songid" element={<SongDetails />} />
                  <Route path="/search/:searchTerm" element={<Search />} />
                </Routes>
              </div>
              <div className="xl:sticky relative top-0 h-fit">
                <TopPlay />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth routes */}
      {isAuthRoute && (
        <div className="flex-1 flex flex-col bg-neutral-100">
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/sign-in" element={<SigninForm />} />
              <Route path="/sign-up" element={<SignupForm />} />
            </Route>
          </Routes>
        </div>
      )}

      {/* Music player */}
      {activeSong?.title && (
        <div className="absolute h-28 bottom-0 left-0 right-0 flex animate-slideup bg-gradient-to-br from-white/10 to-[#414148] backdrop-blur-lg rounded-t-3xl z-50">
          <MusicPlayer />
        </div>
      )}
    </>
  );
};

export default App;
