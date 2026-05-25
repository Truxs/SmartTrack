import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Shell from './Shell';
import {
    Home,
    Package,
    Heart,
    ShoppingCart,
    LogOut,
    Globe,
    Sparkles,
    Fish,
    Snowflake,
    Microwave,
    ChefHat,
    Thermometer,
    Utensils,
    ShoppingBag,
    Layers,
    PackageOpen,
    Coffee,
    HeartPulse,
    HomeIcon,
    PawPrint,
    ShieldCheck
} from 'lucide-react';

const CATEGORIES = [
    { id: 'only-sm', name: 'Only in SmartTrack', icon: Globe },
    { id: 'complete-home', name: 'Complete Home', icon: HomeIcon },
    { id: 'fresh-produce', name: 'Fresh Produce', icon: Package },
    { id: 'fresh-meat', name: 'Fresh Meat & Seafood', icon: Fish },
    { id: 'frozen-goods', name: 'Frozen Goods', icon: Snowflake },
    { id: 'ready-heat', name: 'Ready to Heat & Eat Items', icon: Microwave },
    { id: 'ready-cook', name: 'Ready to Cook', icon: ChefHat },
    { id: 'chilled-dairy', name: 'Chilled & Dairy Items', icon: Thermometer },
    { id: 'bakery', name: 'Bakery', icon: Utensils },
    { id: 'international', name: 'International Goods', icon: ShoppingBag },
    { id: 'pantry', name: 'Pantry', icon: Layers },
    { id: 'snacks', name: 'Snacks', icon: PackageOpen },
    { id: 'beverages', name: 'Beverages', icon: Coffee },
    { id: 'health-beauty', name: 'Health & Beauty', icon: HeartPulse },
    { id: 'home-care', name: 'Home Care', icon: HomeIcon },
    { id: 'pet-care', name: 'Pet Care', icon: PawPrint },
    { id: 'health-hygiene', name: 'Health & Hygiene Essentials', icon: ShieldCheck },
];

const UserLayout = ({ sidebar, headerContent, children }) => {
    return (
        <Shell sidebar={sidebar} headerContent={headerContent}>
            {children}
        </Shell>
    );
};

export default UserLayout;
