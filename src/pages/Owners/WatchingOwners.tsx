import { useQuery } from '@tanstack/react-query'
import { Button, Divider, Icon } from 'actify'
import { getOwners } from 'common/services/ownerService'
import OwnersList from 'components/OwnersList'
import SearchBar from 'components/Searchbar'
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router'
import React from 'react'

export default function WatchingOwners() {
    const [searchValue, setSearchValue] = React.useState("");
    const [searchParams] = useSearchParams();
    const [viewMode, setViewMode] = React.useState(false);
    const [createMode, setCreateMode] = React.useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const detailsRef = React.useRef(null);
    const searchQuery = searchParams.get("search");
    const ownersQuery = useQuery({
        queryKey: ["owneros", searchQuery],
        queryFn: () => getOwners({searchInput: searchQuery})
    });

    React.useEffect(() => {
        if (location.pathname.includes("/view/"))
            setViewMode(true);
        else setViewMode(false);
        if (location.pathname.includes("/create"))
            setCreateMode(true);
        else setCreateMode(false);
    }, [location.pathname]);

    const handleSubmit = React.useCallback((e: React.FormEvent) => {
        e.preventDefault();

        const trimmedValue = searchValue.trim();
        navigate(trimmedValue !== "" 
            ? {search: `?search=${trimmedValue}`}
            : {search: undefined}
        );
    }, [searchValue])

    return (
        <>
        <div className="flex h-full">
            <div className={`grow-1 flex-col ${viewMode || createMode ? "hidden md:flex" : "flex"}`}>
                <div className="flex items-center justify-between mx-4 mt-4">
                    <h2 className="text-2xl font-bold">Donos</h2>
                    <Button variant='outlined' style={{paddingInlineStart: "1rem"}}
                    isDisabled={createMode} onPress={() => navigate("create")}>
                        <Icon className={"[--md-icon-size:1.2rem]"}>Add</Icon>
                        <span className='text-md'>Adicionar dono</span>
                    </Button>
                </div>
                <SearchBar placeholder='Pesquise por donos' className='mx-4 mt-2'
                value={searchValue} onChange={e => setSearchValue(e.target.value)}
                onSubmit={handleSubmit}/>
                {ownersQuery.isSuccess && <OwnersList owners={ownersQuery.data} 
                nextFocusRef={detailsRef} search={searchQuery?.trim()}/>}
            </div>
            <div className={`h-full hidden ${(viewMode || createMode) && "md:block"}`} >
                <Divider orientation='vertical'/>
            </div>
            <section ref={detailsRef} className={`peer/secou w-full h-full overflow-y-auto box-border
            md:w-[60%] outline-0 ${viewMode || createMode ? "block" : "hidden"}`}>
                <Outlet />
            </section>
        </div>
        </>
    )
}
