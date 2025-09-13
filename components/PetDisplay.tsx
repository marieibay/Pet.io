import React, { useState, useEffect, useRef } from 'react';

interface FoodParticle {
    id: number;
    x: number;
    y: number;
}

interface PetDisplayProps {
    onFeed: () => void;
    isHappy: boolean;
    isAlive: boolean;
}

const usePetAnimation = (isHappy: boolean, isAlive: boolean) => {
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [isFlipped, setIsFlipped] = useState(false);
    
    const targetRef = useRef({ x: 50, y: 50 });
    const positionRef = useRef({ x: 50, y: 50 });
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        if (!isAlive) return;

        const move = (_timestamp: number) => {
            const currentPos = positionRef.current;
            const targetPos = targetRef.current;

            const dx = targetPos.x - currentPos.x;
            const dy = targetPos.y - currentPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 2) {
                targetRef.current = {
                    x: Math.random() * 80 + 10,
                    y: Math.random() * 80 + 10,
                };
            } else {
                const speed = isHappy ? 0.05 : 0.02;
                positionRef.current = {
                    x: currentPos.x + dx * speed,
                    y: currentPos.y + dy * speed,
                };
                setPosition(positionRef.current);
                setIsFlipped(dx < 0);
            }
            animationFrameId.current = requestAnimationFrame(move);
        };
        animationFrameId.current = requestAnimationFrame(move);

        return () => {
            if(animationFrameId.current !== null) cancelAnimationFrame(animationFrameId.current);
        };
    }, [isHappy, isAlive]);

    return { position, isFlipped };
};


const PetDisplay: React.FC<PetDisplayProps> = ({ onFeed, isHappy, isAlive }) => {
    const [foodParticles, setFoodParticles] = useState<FoodParticle[]>([]);
    const { position, isFlipped } = usePetAnimation(isHappy, isAlive);

    const handleFeedClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!isAlive) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const newFood: FoodParticle = { id: Date.now(), x, y };
        setFoodParticles(prev => [...prev, newFood]);
        onFeed();

        setTimeout(() => {
            setFoodParticles(prev => prev.filter(p => p.id !== newFood.id));
        }, 2500);
    };

    const getPetEmoji = () => {
        if (!isAlive) return '☠️';
        return isHappy ? '🐠' : '💧';
    };

    const petTransform = `translate(-50%, -50%) scaleX(${isFlipped ? -1 : 1})`;

    return (
        <div 
            className="relative w-full h-80 bg-indigo-900 mb-6 overflow-hidden cursor-pointer tank-retro"
            onClick={handleFeedClick}
        >
            {foodParticles.map(particle => (
                <span
                    key={particle.id}
                    className="absolute text-yellow-300 text-2xl animate-fall z-20"
                    style={{ left: particle.x, top: particle.y }}
                >
                    ■
                </span>
            ))}

            <span
                className="absolute text-7xl transition-transform duration-1000 linear z-10"
                style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    transform: petTransform
                }}
            >
                {getPetEmoji()}
            </span>
        </div>
    );
};

export default PetDisplay;