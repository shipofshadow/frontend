import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config.ts';

interface ApiStatusGuardProps {
    children: React.ReactNode;
    retryInterval?: number;
}

const ApiStatusGuard: React.FC<ApiStatusGuardProps> = ({
                                                           children,
                                                           retryInterval = 30
                                                       }) => {
    const [isOnline, setIsOnline] = useState<boolean | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [nextRetryIn, setNextRetryIn] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);

    // Game states
    const [gameActive, setGameActive] = useState(false);
    const [score, setScore] = useState(0);
    const [papers, setPapers] = useState<Array<{
        emoji: any;
        name: string | undefined;
        points: number;
        id: number, x: number, y: number, type: string}>>([]);
    const [gameTime, setGameTime] = useState(0);
    const [highScore, setHighScore] = useState(() =>
        parseInt(localStorage.getItem('ischolar-papers-highscore') || '0')
    );
    const [showEasterEgg, setShowEasterEgg] = useState(false);
    const [clickCount, setClickCount] = useState(0);

    const scholarshipPapers = [
        { type: 'scholarship', emoji: '🏆', points: 10, name: 'Academic Excellence' },
        { type: 'scholarship', emoji: '💰', points: 15, name: 'Need-Based Aid' },
        { type: 'scholarship', emoji: '🎓', points: 12, name: 'Merit Scholarship' },
        { type: 'scholarship', emoji: '📚', points: 8, name: 'Study Grant' },
        { type: 'bomb', emoji: '💣', points: -20, name: 'Rejection Letter' },
        { type: 'bonus', emoji: '⭐', points: 25, name: 'Full Ride!' }
    ];

    const checkApi = useCallback(async (): Promise<boolean> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/ping`, {
                timeout: 10000
            });

            if (response.status === 200) {
                setIsOnline(true);
                setRetryCount(0);
                if (gameActive) {
                    // Save high score when connection returns
                    if (score > highScore) {
                        localStorage.setItem('ischolar-papers-highscore', score.toString());
                        setHighScore(score);
                    }
                    setGameActive(false);
                }
                return true;
            }
            throw new Error('Invalid response');
        } catch (error) {
            console.error("API is down:", error);
            setIsOnline(false);
            return false;
        }
    }, [gameActive, score, highScore]);

    const handleRetry = useCallback(async () => {
        setIsRetrying(true);
        const success = await checkApi();
        setIsRetrying(false);

        if (!success) {
            setRetryCount(prev => prev + 1);
        }
    }, [checkApi]);

    // Easter egg activation (click server icon 5 times)
    const handleServerIconClick = () => {
        setClickCount(prev => {
            const newCount = prev + 1;
            if (newCount >= 5) {
                setShowEasterEgg(true);
                return 0;
            }
            return newCount;
        });
    };

    // Start the scholarship paper catching game
    const startGame = () => {
        setGameActive(true);
        setScore(0);
        setPapers([]);
        setGameTime(60); // 60 second game
    };

    // Game loop - spawn papers and update positions
    useEffect(() => {
        if (!gameActive) return;

        const gameInterval = setInterval(() => {
            // Spawn new papers
            if (Math.random() < 0.3) {
                const paperType = scholarshipPapers[Math.floor(Math.random() * scholarshipPapers.length)];
                const newPaper = {
                    id: Date.now() + Math.random(),
                    x: Math.random() * 80 + 10,
                    y: -10,
                    type: paperType.type,
                    emoji: paperType.emoji,
                    points: paperType.points,
                    name: paperType.name
                };
                setPapers(prev => [...prev, newPaper]);
            }

            // Move papers down and remove off-screen ones
            setPapers(prev =>
                prev.map(paper => ({ ...paper, y: paper.y + 2 }))
                    .filter(paper => paper.y < 110)
            );

            // Update game timer
            setGameTime(prev => {
                if (prev <= 1) {
                    setGameActive(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 100);

        return () => clearInterval(gameInterval);
    }, [gameActive]);

    // Catch paper
    const catchPaper = (paperId: number, points: number) => {
        setPapers(prev => prev.filter(paper => paper.id !== paperId));
        setScore(prev => Math.max(0, prev + points));
    };

    // Auto-retry countdown
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (isOnline === false && nextRetryIn > 0 && !gameActive) {
            intervalId = setInterval(() => {
                setNextRetryIn(prev => {
                    if (prev <= 1) {
                        handleRetry();
                        return retryInterval;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isOnline, nextRetryIn, handleRetry, retryInterval, gameActive]);

    // Initial check
    useEffect(() => {
        const initialCheck = async () => {
            const success = await checkApi();
            if (!success) {
                setNextRetryIn(retryInterval);
            }
        };

        initialCheck();
    }, [checkApi, retryInterval]);

    // Loading state
    if (isOnline === null) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-gradient"
                 style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                <div className="spinner-border text-light mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Connecting to iScholar...</span>
                </div>
                <h4 className="text-white mb-2">🎓 Connecting to iScholar...</h4>
                <p className="text-light opacity-75">Preparing your scholarship portal</p>
            </div>
        );
    }

    // Offline state with game
    if (!isOnline) {
        return (
            <div className="vh-100 bg-gradient position-relative overflow-hidden"
                 style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>

                {/* Game papers */}
                {gameActive && papers.map(paper => (
                    <div
                        key={paper.id}
                        className="position-absolute cursor-pointer"
                        style={{
                            left: `${paper.x}%`,
                            top: `${paper.y}%`,
                            fontSize: '2rem',
                            transform: 'translateX(-50%)',
                            zIndex: 10,
                            cursor: 'pointer',
                            animation: 'float 2s ease-in-out infinite'
                        }}
                        onClick={() => catchPaper(paper.id, paper.points)}
                        title={`${paper.name} (${paper.points > 0 ? '+' : ''}${paper.points} points)`}
                    >
                        {paper.emoji}
                    </div>
                ))}

                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                    <div className="card border-0 shadow-lg bg-white bg-opacity-95"
                         style={{ maxWidth: '500px', width: '90%', backdropFilter: 'blur(10px)' }}>
                        <div className="card-body text-center p-5">

                            {/* Game UI */}
                            {gameActive && (
                                <div className="position-absolute top-0 start-0 w-100 p-3 bg-primary text-white">
                                    <div className="row">
                                        <div className="col">
                                            <strong>Score: {score}</strong>
                                        </div>
                                        <div className="col text-center">
                                            <strong>Time: {gameTime}s</strong>
                                        </div>
                                        <div className="col text-end">
                                            <strong>High: {highScore}</strong>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <small>Catch scholarships! Avoid rejections! 🏆💰📚⭐ (avoid 💣)</small>
                                    </div>
                                </div>
                            )}

                            <div className={gameActive ? 'mt-5 pt-4' : ''}>
                                {/* Server icon with easter egg trigger */}
                                <div className="mb-4">
                                    <div
                                        onClick={handleServerIconClick}
                                        className="d-inline-block cursor-pointer"
                                        style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <i className="fas fa-server text-warning" style={{ fontSize: '4rem' }}></i>
                                    </div>
                                </div>

                                <h2 className="card-title text-danger mb-3">
                                    🚫 iScholar Server Unavailable
                                </h2>

                                {!gameActive && (
                                    <>

                                        {/* Description */}
                                        <p className="card-text text-muted mb-4">
                                            iScholar server is currently unreachable. This could be due to:
                                        </p>

                                        {/* Possible causes */}
                                        <ul className="list-unstyled text-start text-muted mb-4">
                                            <li className="mb-2">
                                                <i className="fas fa-circle text-secondary me-2" style={{ fontSize: '0.5rem' }}></i>
                                                Server maintenance
                                            </li>
                                            <li className="mb-2">
                                                <i className="fas fa-circle text-secondary me-2" style={{ fontSize: '0.5rem' }}></i>
                                                Network connectivity issues
                                            </li>
                                            <li className="mb-2">
                                                <i className="fas fa-circle text-secondary me-2" style={{ fontSize: '0.5rem' }}></i>
                                                Temporary service interruption
                                            </li>
                                        </ul>

                                        {showEasterEgg && (
                                            <div className="alert alert-success mb-4">
                                                <h5>🎮 Easter Egg Unlocked!</h5>
                                                <p className="mb-0">Play "Scholarship Hunter" while waiting!</p>
                                            </div>
                                        )}

                                        <div className="d-flex flex-column gap-3">
                                            <button
                                                className="btn btn-primary btn-lg"
                                                onClick={handleRetry}
                                                disabled={isRetrying}
                                            >
                                                {isRetrying ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Reconnecting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-redo me-2"></i>
                                                        Try Connection
                                                    </>
                                                )}
                                            </button>

                                            {showEasterEgg && (
                                                <button
                                                    className="btn btn-success btn-lg"
                                                    onClick={startGame}
                                                >
                                                    <i className="fas fa-gamepad me-2"></i>
                                                    Play Scholarship Hunter
                                                </button>
                                            )}

                                            {nextRetryIn > 0 && !isRetrying && (
                                                <small className="text-muted">
                                                    <i className="fas fa-clock me-2"></i>
                                                    Auto retry in {nextRetryIn}s
                                                </small>
                                            )}
                                        </div>

                                        {highScore > 0 && showEasterEgg && (
                                            <div className="mt-4 p-3 bg-light rounded">
                                                <small className="text-muted">
                                                    🏆 Your High Score: <strong>{highScore}</strong> points
                                                </small>
                                            </div>
                                        )}

                                        {retryCount > 0 && (
                                            <div className="mt-3">
                                                <small className="text-muted">
                                                    Connection attempts: {retryCount}
                                                    {!showEasterEgg && clickCount > 0 && (
                                                        <span className="ms-2 text-primary">
                                                            (Click server {5 - clickCount} more times 🤫)
                                                        </span>
                                                    )}
                                                </small>
                                            </div>
                                        )}
                                    </>
                                )}

                                {gameActive && (
                                    <div className="mt-4">
                                        <p className="text-muted">
                                            Click falling items to catch scholarships and avoid rejections!
                                        </p>
                                        <button
                                            className="btn btn-outline-secondary"
                                            onClick={() => setGameActive(false)}
                                        >
                                            End Game
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <style>{`
                    @keyframes float {
                        0%, 100% { transform: translateX(-50%) rotate(0deg); }
                        50% { transform: translateX(-50%) rotate(10deg); }
                    }
                    .cursor-pointer { cursor: pointer; }
                `}</style>
            </div>
        );
    }

    return <>{children}</>;
};

export default ApiStatusGuard;
