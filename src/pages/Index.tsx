import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface SpaceObject {
  id: number;
  x: number;
  y: number;
  size: number;
  type: 'star' | 'planet' | 'satellite' | 'blackhole';
  color: string;
  name: string;
  exploded?: boolean;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

const CosmicExplorer = () => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [objects, setObjects] = useState<SpaceObject[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'first_star', name: 'Звездный разрушитель', description: 'Взорвать первую звезду', unlocked: false, icon: '⭐' },
    { id: 'explorer', name: 'Космический исследователь', description: 'Увеличить зум до максимума', unlocked: false, icon: '🔭' },
    { id: 'destroyer', name: 'Разрушитель миров', description: 'Взорвать 5 звезд', unlocked: false, icon: '💥' },
    { id: 'blackhole_finder', name: 'Охотник за черными дырами', description: 'Найти черную дыру', unlocked: false, icon: '🕳️' }
  ]);
  const [explodedStars, setExplodedStars] = useState(0);
  const [showAchievements, setShowAchievements] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Генерация космических объектов
  useEffect(() => {
    const generateObjects = () => {
      const newObjects: SpaceObject[] = [];
      const objectCount = Math.floor(1000 + zoomLevel * 500);
      
      for (let i = 0; i < objectCount; i++) {
        const types: SpaceObject['type'][] = ['star', 'star', 'star', 'planet', 'satellite'];
        if (zoomLevel >= 5) types.push('blackhole');
        
        const type = types[Math.floor(Math.random() * types.length)];
        const colors = {
          star: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
          planet: ['#8B4513', '#FF4500', '#32CD32', '#4169E1', '#9370DB'],
          satellite: ['#C0C0C0', '#A0A0A0', '#D3D3D3'],
          blackhole: ['#000000']
        };
        
        newObjects.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: type === 'blackhole' ? 8 + Math.random() * 4 : 1 + Math.random() * (type === 'planet' ? 6 : 3),
          type,
          color: colors[type][Math.floor(Math.random() * colors[type].length)],
          name: `${type}-${i}`,
          exploded: false
        });
      }
      
      setObjects(newObjects);
    };

    generateObjects();
  }, [zoomLevel]);

  // Обработка зума
  const handleZoom = (direction: 'in' | 'out') => {
    setZoomLevel(prev => {
      const newZoom = direction === 'in' ? Math.min(prev + 1, 10) : Math.max(prev - 1, 1);
      if (newZoom === 10) {
        unlockAchievement('explorer');
      }
      return newZoom;
    });
  };

  const unlockAchievement = (id: string) => {
    setAchievements(prev => prev.map(achievement => 
      achievement.id === id && !achievement.unlocked 
        ? { ...achievement, unlocked: true }
        : achievement
    ));
    
    const achievement = achievements.find(a => a.id === id);
    if (achievement && !achievement.unlocked) {
      toast.success(`🏆 Достижение разблокировано: ${achievement.name}!`);
    }
  };

  // Обработка двойного клика по объекту
  const handleObjectDoubleClick = (objectId: number) => {
    const object = objects.find(obj => obj.id === objectId);
    if (object && object.type === 'star' && !object.exploded) {
      setObjects(prev => prev.map(obj => 
        obj.id === objectId ? { ...obj, exploded: true } : obj
      ));
      
      setExplodedStars(prev => {
        const newCount = prev + 1;
        if (newCount === 1) unlockAchievement('first_star');
        if (newCount === 5) unlockAchievement('destroyer');
        return newCount;
      });
      
      toast.success(`💥 Звезда ${object.name} взорвана!`);
    }
    
    if (object && object.type === 'blackhole') {
      unlockAchievement('blackhole_finder');
      toast.success('🕳️ Вы обнаружили черную дыру!');
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden" 
         style={{ 
           backgroundImage: `url(/img/6a9c867c-4093-4ab1-86c1-d0bce01ff2e6.jpg)`,
           backgroundSize: 'cover',
           backgroundPosition: 'center'
         }}>
      
      {/* Интерфейс управления */}
      <div className="absolute top-4 left-4 z-10 space-y-4">
        <Card className="p-4 bg-black/80 border-gray-700">
          <div className="flex items-center gap-4 text-white">
            <Button
              onClick={() => handleZoom('in')}
              disabled={zoomLevel >= 10}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Icon name="ZoomIn" size={20} />
            </Button>
            
            <div className="text-center">
              <Icon name="Telescope" size={32} className="text-yellow-400 mx-auto mb-2" />
              <div className="text-sm">Зум: {zoomLevel}x</div>
            </div>
            
            <Button
              onClick={() => handleZoom('out')}
              disabled={zoomLevel <= 1}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Icon name="ZoomOut" size={20} />
            </Button>
          </div>
        </Card>

        <Card className="p-4 bg-black/80 border-gray-700">
          <div className="text-white text-sm space-y-2">
            <div>🌟 Объекты: {objects.length}</div>
            <div>💥 Взорвано звезд: {explodedStars}</div>
            <div>🔭 Уровень исследования: {Math.floor(zoomLevel * 10)}%</div>
          </div>
        </Card>
      </div>

      {/* Кнопка достижений */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={() => setShowAchievements(!showAchievements)}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          <Icon name="Trophy" size={20} />
          <span className="ml-2">Достижения</span>
          <Badge className="ml-2 bg-white text-black">
            {achievements.filter(a => a.unlocked).length}/{achievements.length}
          </Badge>
        </Button>
      </div>

      {/* Панель достижений */}
      {showAchievements && (
        <Card className="absolute top-16 right-4 z-20 p-4 bg-black/90 border-gray-700 max-w-sm">
          <h3 className="text-white font-bold mb-4 flex items-center">
            <Icon name="Trophy" size={20} className="mr-2 text-yellow-400" />
            Достижения
          </h3>
          <div className="space-y-3">
            {achievements.map(achievement => (
              <div key={achievement.id} 
                   className={`p-3 rounded border ${achievement.unlocked 
                     ? 'border-yellow-400 bg-yellow-400/10' 
                     : 'border-gray-600 bg-gray-800/50'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <div className={`font-semibold ${achievement.unlocked ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {achievement.name}
                    </div>
                    <div className="text-sm text-gray-300">{achievement.description}</div>
                  </div>
                  {achievement.unlocked && (
                    <Icon name="Check" size={16} className="text-green-400 ml-auto" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Космические объекты */}
      <div 
        ref={containerRef}
        className="absolute inset-0 transition-transform duration-300"
        style={{ 
          transform: `scale(${1 + (zoomLevel - 1) * 0.5})`,
          transformOrigin: 'center center'
        }}
      >
        {objects.map(object => (
          <div
            key={object.id}
            className={`absolute cursor-pointer transition-all duration-200 hover:scale-125 ${
              object.exploded ? 'animate-pulse opacity-30' : ''
            }`}
            style={{
              left: `${object.x}%`,
              top: `${object.y}%`,
              width: `${object.size * (zoomLevel * 0.5 + 1)}px`,
              height: `${object.size * (zoomLevel * 0.5 + 1)}px`,
              backgroundColor: object.type === 'blackhole' ? '#000' : object.color,
              borderRadius: object.type === 'planet' ? '50%' : object.type === 'blackhole' ? '50%' : '50%',
              boxShadow: object.type === 'star' && !object.exploded 
                ? `0 0 ${object.size * 2}px ${object.color}` 
                : object.type === 'blackhole'
                ? `0 0 20px #8B5CF6, inset 0 0 20px #000`
                : 'none',
              border: object.type === 'blackhole' ? '2px solid #8B5CF6' : 'none',
              animation: object.type === 'star' && !object.exploded ? 'pulse 2s infinite' : 'none'
            }}
            onDoubleClick={() => handleObjectDoubleClick(object.id)}
            title={`${object.type}: ${object.name}`}
          >
            {object.exploded && (
              <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping" />
            )}
            {object.type === 'satellite' && (
              <div className="absolute inset-0 border border-gray-400 rounded-full animate-spin" />
            )}
          </div>
        ))}
      </div>

      {/* Инструкции */}
      <div className="absolute bottom-4 left-4 z-10">
        <Card className="p-4 bg-black/80 border-gray-700 max-w-md">
          <div className="text-white text-sm space-y-2">
            <div className="font-bold text-yellow-400">🚀 Управление:</div>
            <div>🔭 Используйте бинокль для увеличения зума</div>
            <div>⭐ Двойной клик по звезде - взрыв</div>
            <div>🕳️ Найдите черные дыры на максимальном зуме</div>
            <div>🏆 Собирайте достижения за исследования</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CosmicExplorer;