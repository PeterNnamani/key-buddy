const levels = [
    {
        // Level 1: Static Sentence (User types full sentence in place)
        words: [
            "The quick brown fox jumps over the lazy dog while the wind gently blows through the tall green grass.",
            "Every evening, the children gather around the fireplace to listen to their grandfather’s adventurous stories.",
            "On weekends, we walk through the quiet forest trail and observe birds building nests in the trees above.",
            "She practiced piano every day after school so she could play her favorite song perfectly at the recital.",
            "The sky turned orange and purple as the sun slowly set behind the distant snow-covered mountains.",
            "Baking cookies with mom on a rainy day is one of my favorite childhood memories that I will always treasure.",
            "Before the trip, we packed our bags with clothes, snacks, toys, and games to keep us busy on the road.",
            "A group of friends built a treehouse in the backyard, painting it blue and decorating it with fairy lights.",
            "The dog barked excitedly when it saw the mailman approach the house, wagging its tail in joy.",
            "During the summer, we visited the beach almost every day to swim, build sandcastles, and collect seashells."
        ],
        timeLimit: 75,
        requiredSpeed: 20,
    },
    {
        // Level 2: Horizontal Scrolling Word-by-Word
        words: [
            "When the teacher announced the class would go on a field trip, everyone jumped up from their seats in excitement.",
            "The little boy carefully balanced the stack of books in his hands while walking slowly to the library desk.",
            "Each morning, the baker wakes up before sunrise to prepare fresh bread and pastries for the local customers.",
            "Our science project involved growing plants in different conditions to see which one would grow the fastest.",
            "After finishing their homework, the kids gathered outside to play soccer until the streetlights turned on.",
            "The storm shook the windows and made the lights flicker, but we stayed calm and read books by flashlight.",
            "She trained her puppy by giving it treats every time it sat, rolled over, or followed a new command.",
            "Grandma’s garden was full of colorful flowers, buzzing bees, and butterflies dancing in the sunlight.",
            "He drew a comic book with superheroes who could fly, become invisible, and shoot laser beams from their eyes.",
            "At the end of the race, everyone cheered as the last runner crossed the finish line with a big smile."
        ],
        timeLimit: 80,
        requiredSpeed: 25,
    },
    {
        // Level 3: Bottom-to-Top Moving Words
        words: [
            "With determination and daily effort, she learned to ride a bicycle without training wheels by the end of the week.",
            "The classroom was filled with laughter as students worked together on an art project using paint and recycled materials.",
            "At night, the city glows with lights from cars, buildings, and signs, creating a magical view from the rooftop.",
            "They built a cardboard rocket ship and pretended to explore distant planets filled with aliens and treasure.",
            "Each page of the mystery book made me want to read more and find out who had stolen the ancient gem.",
            "The scientist mixed colorful chemicals in test tubes, observing how they bubbled, fizzed, and changed colors.",
            "We spent the afternoon creating a scavenger hunt that led to a hidden box of candy buried under the old tree.",
            "The magician pulled a rabbit out of his hat and amazed the audience with disappearing cards and floating objects.",
            "As the snow fell, we built a snowman, gave him a scarf and hat, and laughed when a bird landed on his nose.",
            "With teamwork, courage, and a map, the explorers reached the secret cave and discovered glowing crystals inside."
        ],
        timeLimit: 85,
        requiredSpeed: 30,
    },
    {
        // Level 4: Appearing and Disappearing Words (Memory & Speed Challenge)
        words: [
            "Even when things seem difficult, remember that every challenge helps you become stronger and more confident.",
            "Kindness spreads quickly when you smile at someone, help a friend, or speak with encouragement and respect.",
            "Every dream starts with one small step forward, followed by another, until you arrive at your big goal.",
            "Courage means doing what’s right, even if it’s hard, and believing in yourself when others might doubt you.",
            "You learn the most not when things are easy, but when you keep going despite obstacles in your way.",
            "Listening carefully helps you understand others, solve problems, and become a better friend or teammate.",
            "Never be afraid to ask questions, because curiosity is the first step toward discovering something amazing.",
            "Teamwork means working together, sharing ideas, and trusting each other to reach a common goal.",
            "When you forgive someone, you set your heart free from anger and make room for peace and understanding.",
            "Believing in yourself is the first step to unlocking your true potential and achieving great things."
        ],
        timeLimit: 90,
        requiredSpeed: 35,
    },
    {
        // Level 5: Falling Words (Fast reaction test)
        words: [
            "Sometimes you have to try many times before you succeed, and that’s okay because every attempt teaches you something.",
            "The best leaders are those who listen, care about others, and help everyone do their best together.",
            "Your thoughts shape your future, so think big, stay positive, and never doubt your ability to grow.",
            "Be the reason someone smiles today by showing kindness, sharing joy, or simply being there when they need you.",
            "Great things take time, so don’t rush the journey—focus on the process and celebrate every small win.",
            "Mistakes don’t mean failure; they’re proof that you’re learning, growing, and moving closer to your goals.",
            "When you believe in your dreams, even the biggest mountains seem smaller and easier to climb.",
            "Every act of kindness, no matter how small, creates a ripple that spreads far beyond what you can see.",
            "Let go of doubt, trust your path, and take bold steps toward the life you imagine for yourself.",
            "You are capable of amazing things when you stay focused, work hard, and never give up on yourself."
        ],
        timeLimit: 95,
        requiredSpeed: 40,
    }
];

export default levels;
