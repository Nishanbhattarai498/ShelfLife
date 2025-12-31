import { useColorScheme } from 'nativewind';
import { LoadingView } from '../components/ui/States';

export default function Index() {
  const { colorScheme } = useColorScheme();
  
  return (
    <LoadingView message={colorScheme === 'dark' ? 'Warming things up...' : 'Loading ShelfLife...'} />
  );
}
