import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SectionLabel from '../components/common/SectionLabel';
import { 
  KeyRound, 
  DoorOpen, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  RotateCcw,
  BookOpen,
  Atom,
  Binary,
  HelpCircle,
  Home
} from 'lucide-react';

export default function EscapeTheLibrary() {
  const [currentRoom, setCurrentRoom] = useState(1);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [roomError, setRoomError] = useState('');
  const [isEscaped, setIsEscaped] = useState(false);

  const rooms = [
    {
      id: 1,
      title: 'Room 1: The Archives of Factoring',
      subject: 'Mathematics & Mechanics',
      icon: BookOpen,
      scenario: 'You are locked in the ancient mathematics wing. The stone door is sealed by a quadratic cipher: "To turn the iron bolt, find the two positive roots of x² - 7x + 12 = 0."',
      question: 'Which pair of roots satisfies the archivist’s door seal?',
      options: [
        { key: 'A', text: 'x = 2 and x = 5' },
        { key: 'B', text: 'x = 3 and x = 4' },
        { key: 'C', text: 'x = -3 and x = -4' },
        { key: 'D', text: 'x = 1 and x = 12' },
      ],
      correct: 'B',
      explanation: 'Factorizing x² - 7x + 12 = (x - 3)(x - 4) = 0 yields x = 3 and x = 4. The bolt clicks open!',
      unlockMessage: 'The ancient iron bolt unlocks! You step into the next corridor.',
    },
    {
      id: 2,
      title: 'Room 2: The Element & Vector Chamber',
      subject: 'Physics & Chemistry',
      icon: Atom,
      scenario: 'A pressurized laboratory chamber requires balancing the electrostatic force. Two point charges are separated by distance r with force F. The laboratory scale asks: "If the distance r is doubled to 2r, what is the new electrostatic force?"',
      question: 'Select the correct adjusted force to stabilize the chamber pressure:',
      options: [
        { key: 'A', text: 'F / 2' },
        { key: 'B', text: '2F' },
        { key: 'C', text: 'F / 4' },
        { key: 'D', text: '4F' },
      ],
      correct: 'C',
      explanation: 'By Coulomb’s Inverse Square Law, F ∝ 1/r². Doubling distance reduces force to F / 2² = F / 4.',
      unlockMessage: 'The airlock depressurizes safely! The grand vault door is now accessible.',
    },
    {
      id: 3,
      title: 'Room 3: The Grand Vault of Algorithms',
      subject: 'Computer Science & Logic',
      icon: Binary,
      scenario: 'The exit gate to the library is guarded by an autonomous digital lock. A terminal displays this recursive algorithm: solve(4) where solve(1) = 1 and solve(n) = n + solve(n-1).',
      question: 'Input the return value of solve(4) to disengage the security grid:',
      options: [
        { key: 'A', text: '8' },
        { key: 'B', text: '10' },
        { key: 'C', text: '24' },
        { key: 'D', text: '12' },
      ],
      correct: 'B',
      explanation: 'solve(4) = 4 + 3 + 2 + 1 = 10. The security laser grid powers down!',
      unlockMessage: 'The heavy library gates swing wide open! You have successfully escaped!',
    },
  ];

  const currentRoomData = rooms[currentRoom - 1];

  const handleSelectOption = (key) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentRoom]: key }));
    setRoomError('');
  };

  const handleUnlockRoom = () => {
    const selected = selectedAnswers[currentRoom];
    if (!selected) {
      setRoomError('Please choose an answer to test the door mechanism.');
      return;
    }

    if (selected === currentRoomData.correct) {
      setRoomError('');
      if (currentRoom < 3) {
        setCurrentRoom((prev) => prev + 1);
      } else {
        setIsEscaped(true);
      }
    } else {
      setRoomError('Incorrect mechanism! The lock remains sealed. Review the foundational clue and try again.');
    }
  };

  const handleRestart = () => {
    setCurrentRoom(1);
    setSelectedAnswers({});
    setRoomError('');
    setIsEscaped(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 space-y-8">
      {/* Header Banner */}
      <Card variant="surface" className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#E3DCD3]">
        <div className="space-y-1">
          <SectionLabel text="DIAGNOSTIC ADVENTURE" />
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0D0D0D] tracking-tight flex items-center gap-2.5">
            <KeyRound className="w-6 h-6 text-[#F26522]" />
            <span>Escape the Library</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6660]">
            Solve 3 prerequisite mystery chambers using Physics, Chemistry, Maths & CS concepts.
          </p>
        </div>

        <Link to="/student">
          <Button variant="ghost" size="sm" icon={<Home className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
      </Card>

      {/* Escaped State Screen */}
      {isEscaped ? (
        <Card variant="surface" className="p-8 sm:p-12 text-center space-y-6 border border-[#F26522] shadow-xl">
          <div className="w-20 h-20 rounded-full bg-[#EBF7EE] border-2 border-[#1E7E34] text-[#1E7E34] flex items-center justify-center mx-auto shadow-sm">
            <DoorOpen className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#1E7E34]/10 text-[#1E7E34]">
              Mission Accomplished
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#0D0D0D] tracking-tight">
              You Have Escaped the Library! 🎓
            </h2>
            <p className="text-sm text-[#6B6660] max-w-md mx-auto leading-relaxed">
              You successfully solved all 3 foundational prerequisite locks across algebra, Coulomb’s law, and recursion.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link to="/student">
              <Button variant="primary" size="md" icon={<Home className="w-4 h-4" />}>
                Return to Dashboard
              </Button>
            </Link>
            <Button variant="secondary" size="md" onClick={handleRestart} icon={<RotateCcw className="w-4 h-4" />}>
              Play Again
            </Button>
          </div>
        </Card>
      ) : (
        /* Active Room Screen */
        <div className="space-y-6">
          {/* Room Progress Pills */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {rooms.map((room) => {
              const isPast = room.id < currentRoom;
              const isCurrent = room.id === currentRoom;
              return (
                <div
                  key={room.id}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isCurrent
                      ? 'bg-white border-[#F26522] ring-2 ring-[#F26522]/20 shadow-xs'
                      : isPast
                      ? 'bg-[#EBF7EE] border-[#C3E6CB] text-[#1E7E34]'
                      : 'bg-[#F5F0EA] border-[#E3DCD3] text-[#6B6660]'
                  }`}
                >
                  <div className="font-heading font-bold text-xs">
                    {isPast ? '✓ Cleared' : `Room ${room.id}`}
                  </div>
                  <div className="text-[10px] truncate hidden sm:block mt-0.5">
                    {room.subject}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Room Card */}
          <Card variant="surface" className="p-6 sm:p-8 space-y-6 border border-[#E3DCD3] shadow-md">
            <div className="flex items-center justify-between border-b border-[#E3DCD3] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0D0D0D] text-white flex items-center justify-center">
                  <currentRoomData.icon className="w-5 h-5 text-[#F26522]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#F26522]">
                    {currentRoomData.subject}
                  </span>
                  <h2 className="font-heading font-extrabold text-lg sm:text-xl text-[#0D0D0D]">
                    {currentRoomData.title}
                  </h2>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F5F0EA] border border-[#E3DCD3] text-[#6B6660]">
                Untimed Chamber
              </span>
            </div>

            {/* Scenario Narrative */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F0EA] border border-[#E3DCD3] text-xs sm:text-sm text-[#0D0D0D] leading-relaxed italic">
              "{currentRoomData.scenario}"
            </div>

            {/* Question */}
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-base sm:text-lg text-[#0D0D0D]">
                {currentRoomData.question}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentRoomData.options.map((opt) => {
                  const isSelected = selectedAnswers[currentRoom] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleSelectOption(opt.key)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? 'bg-white border-[#F26522] ring-2 ring-[#F26522]/30 shadow-xs'
                          : 'bg-[#F5F0EA] border-[#E3DCD3] hover:border-[#0D0D0D]'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#F26522] text-white' : 'bg-white border border-[#E3DCD3] text-[#0D0D0D]'
                      }`}>
                        {opt.key}
                      </span>
                      <span className="font-heading font-medium text-xs sm:text-sm text-[#0D0D0D]">
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {roomError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {roomError}
              </div>
            )}

            {/* Action Button */}
            <div className="pt-2 flex items-center justify-end">
              <Button
                variant="primary"
                size="md"
                onClick={handleUnlockRoom}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                {currentRoom === 3 ? 'Unlock Library Exit' : 'Unlock Room & Proceed'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
