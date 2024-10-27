import { CardsTable } from './components/cards-table';
import { CreateCardButton } from './components/create-card-button';

export default function PrepaidCards() {
  return (
    <div>
      <section>
        <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl'>Prepaid Cards</h1>
        <p className='leading-7 [&:not(:first-child)]:mt-6'>
          Manage your prepaid cards with ease. Create, print and manage your prepaid cards with just a few clicks.
        </p>
      </section>

      <CreateCardButton />

      <CardsTable />
    </div>
  );
}
