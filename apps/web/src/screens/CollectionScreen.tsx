import { AnimalCard } from '../components/AnimalCard.tsx';
import { AnimalBrowser } from '../components/Browse.tsx';
import { Screen } from '../components/Screen.tsx';

export function CollectionScreen() {
  return (
    <Screen title="Colección" eyebrow="Fichas de especie" back="/">
      <AnimalBrowser renderCard={(entry) => <AnimalCard entry={entry} />} />
    </Screen>
  );
}
