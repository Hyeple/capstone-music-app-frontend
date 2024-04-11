import { motion, useAnimationControls, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import NavigationLink from './NavigationLink';
import {
	HeartIcon,
	HomeIcon,
	MusicalNoteIcon,
	Square2StackIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const containerVariants = {
	
	close: {
		width: '6rem',
		transition: {
			type: 'spring',
			damping: 15,
			duration: 0.5,
		},
	},
	open: {
		width: '16rem',
		transition: {
			type: 'spring',
			damping: 15,
			duration: 0.5,
		},
	},
};

const svgVariants = {
	close: {
		rotate: 360,
	},
	open: {
		rotate: 180,
	},
};

const Navigation = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedProject, setSelectedProject] = useState<string | null>(null);

	const containerControls = useAnimationControls();
	const svgControls = useAnimationControls();
	const favorites = useSelector((state) => state.favorites.favorites);

	useEffect(() => {
		if (isOpen) {
			containerControls.start('open');
			svgControls.start('open');
		} else {
			containerControls.start('close');
			svgControls.start('close');
		}
	}, [isOpen]);

	const handleOpenClose = () => {
		setIsOpen(!isOpen);
		setSelectedProject(null);
	};

	return (
		<>
			<motion.nav
				variants={containerVariants}
				animate={containerControls}
				initial="close"
				className="bg-neutral-900 md:flex flex-col z-30 gap-20 p-5 h-full min-h-screen shadow shadow-neutral-600"
			>
				

				<div className="flex flex-row w-full justify-between place-items-center">
					<Link to="/sign-in">
						<div className={isOpen ? "w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full cursor-pointer" : 'hidden'} />
					</Link>
					<button
						className="p-1 rounded-full flex"
						onClick={() => handleOpenClose()}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1}
							stroke="currentColor"
							className="w-8 h-8 stroke-neutral-200"
						>
							<motion.path
								strokeLinecap="round"
								strokeLinejoin="round"
								variants={svgVariants}
								animate={svgControls}
								d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
								transition={{
									duration: 0.5,
									ease: 'easeInOut',
								}}
							/>
						</svg>
					</button>
				</div>
				<div className="flex flex-col gap-5">
					<NavigationLink name={isOpen ? 'Home' : ''} to="/">
						<HomeIcon className="stroke-inherit stroke-[0.75] w-8 h-8" />
					</NavigationLink>
					<NavigationLink name={isOpen ? 'Practice' : ''} to="/practice">
						<MusicalNoteIcon className="stroke-inherit stroke-[0.75] w-8 h-8" />
					</NavigationLink>
					<NavigationLink name={isOpen ? 'Music Sheet' : ''} to="/musicsheet">
						<Square2StackIcon className="stroke-inherit stroke-[0.75] w-8 h-8" />
					</NavigationLink>
					
					{favorites.map((song) => (
						<Link key={song.id} to={`/songs/${song?.key}`} className="favorite-song-link">
						{song.title}
						</Link>
					))}
				</div>
			</motion.nav>
		</>
	);
};

export default Navigation;