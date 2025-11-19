'use client';
import { TrendingUp } from 'lucide-react';
import { Pie, PieChart } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';

interface CategoryData {
  name: string;
  count: number;
  percentage: number;
}

interface CategoriesPieChartProps {
  categories: CategoryData[];
}

export function CategoriesPieChart({ categories }: CategoriesPieChartProps) {
  // Función para acortar nombres de categorías
  const shortenCategoryName = (name: string): string => {
    const replacements: Record<string, string> = {
      'Culturales y Artísticos': 'Culturales',
      'Culturales y artisticos': 'Culturales',
      'Corporativos / Empresariales': 'Corporativos',
      'Comunitarios o Gubernamentales': 'Comunitarios',
      'Virtuales / Híbridos': 'Virtuales',
      'Benéficos / Solidarios': 'Benéficos',
    };
    return replacements[name] || name;
  };

  // Transformar los datos de categorías al formato que espera recharts
  const chartData = categories.slice(0, 5).map((category, index) => ({
    category: shortenCategoryName(category.name),
    events: category.count,
    percentage: category.percentage,
    fill: `hsl(var(--chart-${index + 1}))`,
  }));

  // Construir la configuración dinámica basada en las categorías
  const chartConfig: ChartConfig = {
    events: {
      label: 'Eventos',
    },
  };

  const totalEvents = categories.reduce((sum, cat) => sum + cat.count, 0);

  // Componente de leyenda personalizado
  const renderLegend = () => {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4 pb-3">
        {chartData.map((item, index) => (
          <div key={item.category} className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: `hsl(var(--chart-${index + 1}))` }}
            />
            <span className="text-xs text-muted-foreground">
              {item.category} ({item.percentage}%)
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Categorías Más Populares</CardTitle>
        <CardDescription>Distribución de eventos por categoría</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
          <PieChart>
            <Pie data={chartData} dataKey="events" nameKey="category" />
          </PieChart>
        </ChartContainer>
        {renderLegend()}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Total: {totalEvents} eventos <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Mostrando las {Math.min(categories.length, 5)} categorías principales
        </div>
      </CardFooter>
    </Card>
  );
}
