import { useQuery } from '@tanstack/react-query'
import { Divider } from 'actify'
import { getOwners } from 'common/services/ownerService'
import OwnersList from 'components/OwnersList'
import SearchBar from 'components/Searchbar'
import { Outlet, useLocation } from 'react-router'
import React from 'react'

export default function WatchingOwners() {
    const [viewMode, setViewMode] = React.useState(false);
    const detailsRef = React.useRef(null);
    const location = useLocation();
    const ownersQuery = useQuery({
        queryKey: ["owneros"],
        queryFn: () => getOwners()
    });

    React.useEffect(() => {
        if (location.pathname.includes("/view/"))
            setViewMode(true);
        else setViewMode(false);
    }, [location.pathname]);

    return (
        <>
        <div className="flex h-full">
            <div className={`grow-1 ${viewMode ? "hidden md:flex md:flex-col" : ""} md:max-w-[50vw]`}>
                <h2 className="text-2xl font-bold ml-4 mt-4">Donos</h2>
                {ownersQuery.isSuccess && <OwnersList owners={ownersQuery.data} nextFocusRef={detailsRef} />}
            </div>
            <div className={`h-full hidden ${viewMode && "md:block"}`} >
                <Divider orientation='vertical'/>
            </div>
            <section ref={detailsRef} className={`peer/secou w-full h-full overflow-y-auto box-border
            md:w-[60%] outline-0 ${viewMode ? "block" : "hidden"}`}>
                <Outlet />
            </section>
        </div>
        </>
    )
}
