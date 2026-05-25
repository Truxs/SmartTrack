import React, { useState } from 'react';
import { Heart, Eye } from 'lucide-react';

const ItemCard = ({ item, onPrimaryAction, onSecondaryAction }) => {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    if (onSecondaryAction) {
      onSecondaryAction(item.id);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 w-64 flex-shrink-0">
      <div className="relative h-40 bg-slate-800 flex items-center justify-center">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="h-full w-full object-cover" 
          />
        ) : (
          <div className="text-slate-500">
            <Eye size={32} />
          </div>
        )}
        <button 
          onClick={handleFavorite}
          className={`absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
            isFavorited 
              ? 'bg-rose-500 text-white' 
              : 'bg-slate-900/80 text-slate-400 hover:text-rose-400'
          }`}
        >
          <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
        </button>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm font-semibold text-white truncate">{item.name}</h3>
        
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-slate-400">{item.weight || item.size || 'N/A'}</span>
          <span className="text-white font-bold">${(item.price || 0).toFixed(2)}</span>
        </div>
        
        <div className="mt-4 flex gap-2">
          <button 
            onClick={() => onPrimaryAction && onPrimaryAction(item.id)}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
          >
            {item.primaryActionText || 'Track'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
