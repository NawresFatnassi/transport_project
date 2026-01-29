
import React from 'react';
import { BusIcon } from './icon';

const Footer: React.FC = () => {
    return (
        <footer className="bg-brand-dark text-slate-300 pt-12 pb-8 px-4">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <div className="flex items-center space-x-2 mb-4">
                        <BusIcon className="w-8 h-8 text-brand-green" />
                        <h2 className="text-2xl font-bold text-white">Transport Manager</h2>
                    </div>
                    <p className="text-slate-400">
                        Votre solution complète pour la gestion de flotte et la réservation de bus.
                    </p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
                    <ul className="space-y-2 text-slate-400">
                        <li>Email: contact@transportmanager.fr</li>
                        <li>Tél: +33 1 23 45 67 89</li>
                        <li>Support: 24/7</li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Informations</h3>
                    <ul className="space-y-2 text-slate-400">
                        <li><a href="#" className="hover:text-brand-green transition-colors">CGV & Mentions légales</a></li>
                        <li><a href="#" className="hover:text-brand-green transition-colors">Politique de confidentialité</a></li>
                        <li><a href="#" className="hover:text-brand-green transition-colors">FAQ & Support</a></li>
                    </ul>
                </div>
            </div>
            <div className="container mx-auto border-t border-slate-700 mt-8 pt-6 text-center text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Transport Manager. Tous droits réservés.</p>
            </div>
        </footer>
    );
};

export default Footer;
