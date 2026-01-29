import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
    BusIcon, 
    TicketIcon, 
    UsersIcon, 
    DashboardIcon, 
    SearchIcon, 
    QrCodeIcon, 
    CalendarIcon 
} from '../components/icon';
import { Link } from 'react-router-dom';
import GuideLocal from '../image/Guide___Transport_Manager.mp4';

interface GuideStepProps {
    number: number;
    title: string;
    description: string;
    icon: React.ReactNode;
}

const GuideStep: React.FC<GuideStepProps> = ({ number, title, description, icon }) => (
    <div className="flex flex-col md:flex-row items-start md:items-center bg-white p-6 rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
        <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
            <div className="relative w-16 h-16 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-full">
                <span className="absolute -top-1 -right-1 bg-brand-purple text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">{number}</span>
                <div className="text-brand-purple text-2xl">{icon}</div>
            </div>
        </div>
        <div>
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 mb-2">{title}</h3>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">{description}</p>
        </div>
    </div>
);

const HelpPage: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<UserRole>(user?.role || UserRole.CLIENT);

    // Video guide will be displayed below.

    const clientSteps = [
        { 
            title: "Rechercher un trajet", 
            description: "Sur la page d'accueil, entrez votre ville de départ, votre destination et la date souhaitée. Cliquez sur 'Rechercher' pour voir les bus disponibles.", 
            icon: <SearchIcon className="w-8 h-8" /> 
        },
        { 
            title: "Réserver votre place", 
            description: "Choisissez le trajet qui vous convient et sélectionnez vos sièges. Le prix sera calculé automatiquement.", 
            icon: <TicketIcon className="w-8 h-8" /> 
        },
        { 
            title: "Gérer vos réservations", 
            description: "Accédez à l'onglet 'Mes Réservations' pour voir vos billets à venir et l'historique de vos voyages. Vous pouvez télécharger vos billets ici.", 
            icon: <CalendarIcon className="w-8 h-8" /> 
        }
    ];

    const driverSteps = [
        { 
            title: "Consulter votre planning", 
            description: "Sur votre tableau de bord, visualisez vos trajets du jour, les horaires de départ et le nombre de passagers attendus.", 
            icon: <DashboardIcon className="w-8 h-8" /> 
        },
        { 
            title: "Scanner les tickets", 
            description: "Lors de l'embarquement, utilisez la fonction 'Scanner QR' pour valider les billets des passagers. Vous pouvez aussi entrer le code manuellement.", 
            icon: <QrCodeIcon className="w-8 h-8" /> 
        },
        { 
            title: "Suivi des trajets", 
            description: "Marquez vos trajets comme 'En cours' ou 'Terminé' pour tenir l'administration informée de votre progression.", 
            icon: <BusIcon className="w-8 h-8" /> 
        }
    ];

    const adminSteps = [
        { 
            title: "Vue d'ensemble", 
            description: "Le Dashboard vous donne les statistiques clés : nombre de bus actifs, revenus du mois et état des trajets en temps réel.", 
            icon: <DashboardIcon className="w-8 h-8" /> 
        },
        { 
            title: "Gestion de la flotte", 
            description: "Ajoutez, modifiez ou mettez en maintenance les bus de votre flotte via l'onglet 'Bus'. Assignez des chauffeurs par défaut.", 
            icon: <BusIcon className="w-8 h-8" /> 
        },
        { 
            title: "Gestion des chauffeurs", 
            description: "Gérez les profils de vos chauffeurs, leurs coordonnées, leurs permis et leurs statuts (disponible, en mission, congé).", 
            icon: <UsersIcon className="w-8 h-8" /> 
        }
    ];

    const getSteps = () => {
        switch(activeTab) {
            case UserRole.ADMIN: return adminSteps;
            case UserRole.DRIVER: return driverSteps;
            default: return clientSteps;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <Header title="Guide d'utilisation">
                 <Link to="/" className="text-white hover:bg-white/20 font-semibold py-2 px-4 rounded-lg">
                    Retour à l'accueil
                 </Link>
            </Header>

            <main className="flex-grow container mx-auto p-4 md:p-8 max-w-5xl">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-slate-800">Comment utiliser Transport Manager ?</h2>
                    <p className="text-slate-500 mt-2">Un guide étape par étape pour tirer le meilleur parti de votre application.</p>
                </div>

                <div className="flex justify-center mb-8">
                    <div className="bg-white p-1 rounded-xl shadow-sm border inline-flex">
                        <button 
                            onClick={() => setActiveTab(UserRole.CLIENT)}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === UserRole.CLIENT ? 'bg-brand-purple text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            Espace Client
                        </button>
                        <button 
                            onClick={() => setActiveTab(UserRole.DRIVER)}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === UserRole.DRIVER ? 'bg-brand-purple text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            Espace Chauffeur
                        </button>
                        <button 
                            onClick={() => setActiveTab(UserRole.ADMIN)}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === UserRole.ADMIN ? 'bg-brand-purple text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            Administration
                        </button>
                    </div>
                </div>

                <div className="grid gap-6 mb-10 md:grid-cols-2">
                    {getSteps().map((step, index) => (
                        <GuideStep 
                            key={index}
                            number={index + 1}
                            title={step.title}
                            description={step.description}
                            icon={step.icon}
                        />
                    ))}
                </div>

                <section className="mb-8">
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Guide vidéo</h3>
                    <div className="bg-white p-4 rounded-2xl border shadow-md overflow-hidden">
                        <div className="relative">
                            <video controls src={GuideLocal} className="w-full h-auto rounded-lg" />
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                <svg className="w-16 h-16 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="12" fill="rgba(0,0,0,0.35)" />
                                    <path d="M10 8l6 4-6 4V8z" fill="white" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </section>

              
            </main>

            <Footer />
        </div>
    );
};

export default HelpPage;