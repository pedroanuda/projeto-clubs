import IOwner from 'common/interfaces/IOwner'
import OwnerCard from './OwnerCard';
import React from 'react'
import { useNavigate } from 'react-router';

interface OwnersListProps {
    owners?: IOwner[],
    nextFocusRef?: React.RefObject<HTMLElement>
}

export default function OwnersList({ owners, nextFocusRef }: OwnersListProps) {
    const [organizedOwners, setOrganizedOwners] = React.useState<Map<string, IOwner[]>>();
    const sectionRef = React.useRef<HTMLElement>(null);
    const navigate = useNavigate();

    React.useEffect(() => {
        const map = new Map<string, IOwner[]>();

        const sortedOwners = owners?.toSorted((a, b) => a.name.localeCompare(b.name));
        sortedOwners?.forEach((owner) => {
            const letter = owner.name.charAt(0).toLocaleUpperCase();

            if (!map.has(letter))
                map.set(letter, [owner]);
            else map.get(letter)?.push(owner);
        });

        setOrganizedOwners(map);
    }, [owners]);

    const cards: JSX.Element[] = [];
    organizedOwners?.keys()?.forEach((letter, letterIdx) => {
        const section: JSX.Element[] = [];
        organizedOwners.get(letter)?.forEach(owner => {
            section.push(
            <OwnerCard onClick={() => {
                setTimeout(() => nextFocusRef?.current?.focus(), 100);
                navigate(`view/${owner.id}`);
            }} onEditClick={() => {
                navigate(`view/${owner.id}?edit=1`);
            }}
            owner={owner} key={owner.id}/>
            )
        })

        cards.push(
        <div key={`div-${letterIdx}`} className='mb-6'>
            <h5 className="pl-4 text-lg font-semibold sticky top-0 z-1" 
            style={{color: "rgb(var(--md-sys-color-secondary))", 
            backgroundColor: "rgb(var(--md-sys-color-surface))"}}>{letter}</h5>
            <div className='flex flex-col gap-1'>
                {section}
            </div>
        </div>);
    })

    return (
        <section className="m-4 mx-2 rounded-lg overflow-y-auto" ref={sectionRef}
        style={{backgroundColor: `rgb(var(--md-sys-color-surface))`}}>
            {cards}
        </section>
    );
}
