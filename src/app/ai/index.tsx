import React, { useMemo, useRef, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../api/client';

import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  Heart,
  Moon,
  ShieldCheck,
  Star,
  MessageCircle,
  RefreshCw,
  HelpCircle,
  Scale,
  Users,
  Baby,
  Wallet,
  Smile,
  ChevronLeft,
  Lightbulb,
  Clock,
  BriefcaseBusiness,
  Home,
  AlertTriangle,
} from 'lucide-react-native';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

type InfoSection = {
  heading: string;
  points: string[];
};

type Category = {
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  intro: string;
  sections: InfoSection[];
  questions: string[];
};

const CATEGORIES: Category[] = [
  {
    title: 'Ask Questions',
    subtitle: 'General Islamic learning support',
    icon: HelpCircle,
    color: '#064E3B',
    intro:
      'A dedicated space for Islamic learning, reminders, and daily guidance. You can ask about worship, manners, family, halal choices, work, studies, emotional struggles, and personal growth.',
    sections: [
      {
        heading: 'Best Ways To Ask',
        points: [
          'Ask clearly and mention your situation if the answer depends on details.',
          'For worship questions, mention whether it concerns salah, fasting, zakat, Quran, or purification.',
          'For family or marriage matters, ask for Islamic advice, but consult a trusted scholar for serious rulings.',
          'For halal and haram matters, avoid acting on doubts until you verify with knowledge.',
        ],
      },
      {
        heading: 'Professional Islamic Reminder',
        points: [
          'This assistant is for learning, reflection, and helpful reminders.',
          'It should not replace a qualified scholar for fatwa, divorce, inheritance shares, medical, or financial contracts.',
          'Use answers as guidance, then verify serious matters with reliable knowledge.',
        ],
      },
    ],
    questions: [
      'How can I become a better Muslim?',
      'How do I improve my salah?',
      'How can I balance deen and daily life?',
      'What should I do when my iman feels low?',
    ],
  },
  {
    title: 'Halal Guidance',
    subtitle: 'Food, money, choices, lifestyle',
    icon: ShieldCheck,
    color: '#0B5D3B',
    intro:
      'Halal living is not only about food. It includes income, speech, relationships, entertainment, business, modesty, and the choices that protect the heart.',
    sections: [
      {
        heading: 'Halal Decision Checklist',
        points: [
          'Ask: does this please Allah or pull me away from Him?',
          'Check whether it involves lying, cheating, oppression, interest, indecency, or harm.',
          'If it concerns food, check ingredients and source when possible.',
          'If it concerns money, check the contract, honesty, fairness, and whether anyone is being exploited.',
          'If the heart is unsettled and the matter is doubtful, choose the safer path until you know.',
        ],
      },
      {
        heading: 'Practical Halal Lifestyle Tips',
        points: [
          'Earn from honest work and avoid shortcuts that damage barakah.',
          'Keep your promises and be transparent in business.',
          'Avoid entertainment that normalizes sin or weakens haya.',
          'Choose friends who make obedience easier.',
          'Spend moderately and avoid wastefulness.',
          'Ask Allah for halal rizq, contentment, and protection from doubtful matters.',
        ],
      },
    ],
    questions: [
      'How do I know if something is halal?',
      'Give me halal lifestyle tips',
      'What should I avoid in business?',
      'How can I earn halal rizq?',
    ],
  },
  {
    title: 'Quran Reflections',
    subtitle: 'Tadabbur, lessons, Quran habits',
    icon: BookOpen,
    color: '#9A6A16',
    intro:
      'The Quran is guidance for the heart, mind, family, character, and society. Reflection helps you move from reading words to living by them.',
    sections: [
      {
        heading: 'A Professional Quran Routine',
        points: [
          'Read a small daily portion that you can maintain.',
          'Choose one ayah and ask: what is Allah teaching me here?',
          'Learn the meaning of the surahs you recite in salah.',
          'Listen to recitation when your heart feels heavy.',
          'Keep a Quran journal for lessons, duas, and actions you want to practice.',
        ],
      },
      {
        heading: 'Reflection Method',
        points: [
          'Look for what the ayah teaches about Allah.',
          'Look for commands, warnings, promises, and examples.',
          'Ask how the ayah corrects your behavior or strengthens your hope.',
          'End reflection with a practical action, even if small.',
        ],
      },
    ],
    questions: [
      'Give me Quran reflection for today',
      'How can I build a Quran habit?',
      'How do I reflect on one ayah?',
      'How can I understand Quran better?',
    ],
  },
  {
    title: 'Spiritual Guidance',
    subtitle: 'Iman, peace, repentance, growth',
    icon: Heart,
    color: '#8B5E16',
    intro:
      'Spiritual strength grows through sincerity, salah, Quran, repentance, gratitude, patience, and keeping the heart connected to Allah.',
    sections: [
      {
        heading: 'Daily Spiritual Health',
        points: [
          'Protect the five prayers before every other routine.',
          'Begin your day with gratitude and intention.',
          'Make repentance part of your daily life, not only after major mistakes.',
          'Reduce sins that repeatedly weaken the heart.',
          'Keep company with people who remind you of Allah.',
        ],
      },
      {
        heading: 'When Iman Feels Low',
        points: [
          'Do not despair; returning to Allah is itself a blessing.',
          'Start with one small act: wudu, two rak’ahs, Quran, or charity.',
          'Avoid isolating yourself from good people.',
          'Replace guilt with sincere repentance and action.',
          'Ask Allah for firmness and a heart that loves obedience.',
        ],
      },
    ],
    questions: [
      'Give me a daily Islamic reminder',
      'What should I do when my iman feels low?',
      'How can I get closer to Allah?',
      'How do I stop feeling spiritually weak?',
    ],
  },
  {
    title: 'Manners',
    subtitle: 'Akhlaq, speech, respect, character',
    icon: Smile,
    color: '#315C6B',
    intro:
      'Good manners are a visible sign of inner faith. A Muslim’s character should bring safety, mercy, honesty, and dignity to others.',
    sections: [
      {
        heading: 'Core Islamic Manners',
        points: [
          'Speak truthfully and avoid exaggeration.',
          'Do not mock, insult, expose, or embarrass people.',
          'Keep promises and respect people’s trust.',
          'Control anger before it controls your tongue.',
          'Respect elders, show mercy to children, and treat everyone fairly.',
        ],
      },
      {
        heading: 'Speech Discipline',
        points: [
          'Before speaking, ask: is it true, beneficial, and kind?',
          'Avoid gossip, suspicion, and spreading private matters.',
          'Correct people privately when possible.',
          'Use soft words, especially with family.',
          'Silence is better than words that damage hearts.',
        ],
      },
    ],
    questions: [
      'How can I improve my manners?',
      'How can I control anger?',
      'What does Islam say about good speech?',
      'How should I treat people kindly?',
    ],
  },
  {
    title: 'Marriage',
    subtitle: 'Mercy, love, rights, responsibility',
    icon: Users,
    color: '#7C3F58',
    intro:
      'Marriage is a serious trust. A healthy Muslim marriage is built on mercy, respect, communication, responsibility, patience, and fear of Allah.',
    sections: [
      {
        heading: 'Healthy Marriage Principles',
        points: [
          'Speak with respect even during disagreement.',
          'Protect each other’s privacy and dignity.',
          'Show appreciation for small efforts.',
          'Do not weaponize religion to control or humiliate.',
          'Make decisions through consultation and fairness.',
          'Build the home around salah, mercy, and emotional safety.',
        ],
      },
      {
        heading: 'Conflict Guidance',
        points: [
          'Pause before responding in anger.',
          'Discuss one issue at a time.',
          'Avoid insults, threats, and exposing private matters.',
          'Seek trusted counseling when problems repeat.',
          'For abuse, divorce, rights, or serious harm, consult qualified help immediately.',
        ],
      },
    ],
    questions: [
      'Give me Islamic marriage advice',
      'How should spouses treat each other?',
      'How can a couple solve conflict Islamically?',
      'What makes a peaceful Muslim home?',
    ],
  },
  {
    title: 'Inheritance',
    subtitle: 'Justice, estate, rights, caution',
    icon: Scale,
    color: '#604C24',
    intro:
      'Inheritance in Islam is a major trust. It protects rights and prevents oppression, but it must be calculated with knowledge, not emotions or guesses.',
    sections: [
      {
        heading: 'Professional Inheritance Reminder',
        points: [
          'Debts and necessary obligations are handled before distribution.',
          'Shares must not be guessed or changed by family pressure.',
          'No one should hide documents, wealth, property, or debts.',
          'Women, children, spouses, and relatives must not be denied their rights.',
          'Exact shares should be calculated by a qualified scholar or inheritance expert.',
        ],
      },
      {
        heading: 'Family Protection Tips',
        points: [
          'Keep financial records clear while alive.',
          'Write important obligations and debts.',
          'Encourage family transparency.',
          'Do not delay people’s rights without valid reason.',
          'Fear Allah when handling another person’s wealth.',
        ],
      },
    ],
    questions: [
      'Explain inheritance in Islam simply',
      'Why is Islamic inheritance important?',
      'Who should calculate inheritance shares?',
      'What should families do before sharing inheritance?',
    ],
  },
  {
    title: 'Family & Parenting',
    subtitle: 'Home, children, mercy, responsibility',
    icon: Baby,
    color: '#7A4B2A',
    intro:
      'A strong Muslim family is built through mercy, example, salah, Quran, patience, emotional safety, and consistent teaching.',
    sections: [
      {
        heading: 'Parenting With Faith',
        points: [
          'Teach by example before giving lectures.',
          'Let children see salah, Quran, kindness, and honesty in daily life.',
          'Correct mistakes with mercy and wisdom.',
          'Praise good character, not only achievements.',
          'Make Islamic learning warm, beautiful, and consistent.',
        ],
      },
      {
        heading: 'Peaceful Muslim Home',
        points: [
          'Reduce shouting and harsh criticism.',
          'Create small family routines around salah and Quran.',
          'Eat together when possible.',
          'Apologize when wrong so children learn humility.',
          'Protect the home from constant conflict and harmful media.',
        ],
      },
    ],
    questions: [
      'How can I raise children Islamically?',
      'How do I make my home more Islamic?',
      'Give me family advice in Islam',
      'How can parents teach Quran at home?',
    ],
  },
  {
    title: 'Money & Work',
    subtitle: 'Rizq, business, ethics, barakah',
    icon: Wallet,
    color: '#2F5E3E',
    intro:
      'Islamic work ethics protect wealth, dignity, trust, and barakah. Your job and business can become worship when done honestly for Allah.',
    sections: [
      {
        heading: 'Work Ethics',
        points: [
          'Be honest with time, effort, and responsibilities.',
          'Avoid cheating customers, employers, workers, or partners.',
          'Keep contracts clear and promises realistic.',
          'Avoid bribery, oppression, fraud, and hidden harm.',
          'Do not earn by damaging people’s faith, health, or dignity.',
        ],
      },
      {
        heading: 'Barakah In Money',
        points: [
          'Give charity regularly, even if small.',
          'Maintain family ties.',
          'Avoid waste and arrogance.',
          'Pay people fairly and on time.',
          'Thank Allah and use wealth responsibly.',
        ],
      },
    ],
    questions: [
      'How can I have barakah in money?',
      'Give me Islamic work advice',
      'What should I avoid in business?',
      'How do I stay honest at work?',
    ],
  },
  {
    title: 'Daily Routine',
    subtitle: 'Morning, evening, habits, discipline',
    icon: Clock,
    color: '#4C6B3C',
    intro:
      'A structured Islamic routine helps you protect worship, family, work, learning, health, and emotional balance.',
    sections: [
      {
        heading: 'Morning Routine',
        points: [
          'Wake with gratitude and intention.',
          'Pray Fajr on time.',
          'Read or listen to Quran, even briefly.',
          'Plan your day around salah times.',
          'Begin work or study with honesty and purpose.',
        ],
      },
      {
        heading: 'Night Routine',
        points: [
          'Review your actions without hopelessness.',
          'Repent sincerely.',
          'Forgive people for Allah’s sake.',
          'Prepare for Fajr before sleeping.',
          'End the day with gratitude and remembrance.',
        ],
      },
    ],
    questions: [
      'Give me an Islamic morning routine',
      'Give me a night routine in Islam',
      'How can I build good habits?',
      'How do I stay consistent?',
    ],
  },
  {
    title: 'Community',
    subtitle: 'Masjid, neighbors, service, unity',
    icon: Home,
    color: '#395A78',
    intro:
      'Islam encourages service, unity, neighborly care, respect, and building communities that help people come closer to Allah.',
    sections: [
      {
        heading: 'Community Manners',
        points: [
          'Greet people with peace and sincerity.',
          'Avoid spreading rumors and division.',
          'Support the masjid and beneficial programs.',
          'Help neighbors and vulnerable people.',
          'Respect differences in valid scholarly opinions.',
        ],
      },
      {
        heading: 'Serving Others',
        points: [
          'Give your time, skills, money, or kind words.',
          'Check on the sick, elderly, widows, or lonely.',
          'Make spaces welcoming for children and new Muslims.',
          'Correct mistakes with wisdom, not humiliation.',
        ],
      },
    ],
    questions: [
      'How can I help my Muslim community?',
      'What are neighbor rights in Islam?',
      'How should Muslims handle disagreements?',
      'How can I serve the masjid?',
    ],
  },
  {
    title: 'Youth & Studies',
    subtitle: 'School, friends, identity, discipline',
    icon: BriefcaseBusiness,
    color: '#5B4A86',
    intro:
      'Young Muslims need confidence, knowledge, good friends, discipline, and a strong identity rooted in Islam.',
    sections: [
      {
        heading: 'Student Guidance',
        points: [
          'Study with the intention of serving Allah and people.',
          'Protect salah even during school or exams.',
          'Choose friends who respect your deen.',
          'Avoid cheating; barakah matters more than marks.',
          'Use time wisely and avoid harmful distractions.',
        ],
      },
      {
        heading: 'Identity & Confidence',
        points: [
          'Do not feel ashamed of being Muslim.',
          'Learn the reasons behind your beliefs.',
          'Ask questions respectfully and seek knowledge.',
          'Be kind, excellent, and principled.',
        ],
      },
    ],
    questions: [
      'How can I be a better Muslim student?',
      'How do I choose good friends?',
      'How can I balance school and Islam?',
      'How do I stay confident as a Muslim?',
    ],
  },
];

const QUICK_QUESTIONS = [
  'Give me a daily Islamic reminder',
  'How can I improve my salah?',
  'Give me halal guidance tips',
  'Explain patience in Islam',
  'Give me Quran reflection',
  'Marriage advice in Islam',
  'Inheritance reminder in Islam',
  'How can I improve my manners?',
  'Give me Islamic morning routine',
  'How can I build good habits?',
];

const ANSWERS: Record<string, string> = {
  salah:
    'Salah becomes stronger with consistency, humility, and understanding. Pray on time, prepare calmly, learn the meaning of what you recite, avoid rushing, and ask Allah to make prayer beloved to your heart.',
  prayer:
    'Prayer is your direct connection with Allah. Protect its time, pray with humility, and remember that every sincere sajdah is a moment of closeness to Allah.',
  quran:
    'Build your Quran life slowly. Read daily, even a little. Listen, reflect, learn meanings, and practice one lesson at a time.',
  halal:
    'Halal guidance begins with sincerity. Choose lawful income, honest trade, clean food, modest choices, and avoid doubtful matters when possible.',
  haram:
    'If something may be haram, pause and do not rush. Check reliable Islamic evidence, avoid doubtful matters when possible, and ask a qualified scholar for the exact case.',
  marriage:
    'A peaceful Islamic marriage needs mercy, respect, patience, forgiveness, and communication. For serious conflict, consult a qualified scholar or counselor.',
  inheritance:
    'Islamic inheritance has fixed rules and should not be guessed. Debts and obligations are handled first, then shares are calculated by qualified knowledge.',
  parents:
    'Honor parents with gentle speech, service, patience, and dua. Even during disagreement, keep respect and avoid harshness.',
  anger:
    'When angry, seek refuge in Allah, stay silent, change position, make wudu, and delay your response. Strength is controlling yourself for Allah.',
  sadness:
    'When sadness comes, remember Allah knows your pain. Pray if you can, recite Quran, speak to someone trustworthy, and do not lose hope in Allah’s mercy.',
  sad:
    'When sadness comes, remember Allah knows your pain. Pray if you can, recite Quran, speak to someone trustworthy, and do not lose hope in Allah’s mercy.',
  rizq:
    'Barakah in rizq comes through halal earning, honesty, charity, gratitude, avoiding oppression, and trusting Allah while working hard.',
  money:
    'Use money with responsibility. Earn halal, avoid cheating and oppression, give charity, avoid wastefulness, and ask Allah for barakah.',
  manners:
    'Good manners are part of faith. Speak truthfully, avoid gossip, smile, forgive, respect elders, show mercy to children, and keep promises.',
  patience:
    'Sabr means staying obedient, avoiding sin, and trusting Allah during hardship. It does not mean you feel no pain; it means you remain faithful through pain.',
  tawakkul:
    'Tawakkul means trusting Allah while taking the right steps. You plan, work, and try your best, then leave the result to Allah.',
  family:
    'A peaceful Muslim family needs mercy, respect, salah, Quran, patience, and good communication. Teach by example and correct with kindness.',
  children:
    'Raise children with mercy, example, Quran, salah, and good manners. Make Islamic learning warm, consistent, and loving.',
  business:
    'Islamic business should be honest, clear, and fair. Avoid cheating, deception, unclear contracts, bribery, oppression, and interest-based dealings where possible.',
  routine:
    'A good Islamic routine protects Fajr, Quran, work, family, charity, and sleep. Start small and be consistent.',
  community:
    'A healthy Muslim community is built on mercy, service, trust, unity, and sincere advice. Help others and avoid gossip or division.',
  student:
    'A Muslim student should protect salah, study honestly, avoid cheating, choose good friends, and make intention to benefit people through knowledge.',
};

export default function IslamicAIAssistant() {
  const scrollRef = useRef<ScrollView | null>(null);

  const [screen, setScreen] =
    useState<'home' | 'assistant' | 'category'>('home');

  const [activeCategory, setActiveCategory] =
    useState<Category | null>(null);

  const [categoryQuestion, setCategoryQuestion] =
    useState('');

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text:
        'Assalamu Alaikum wa Rahmatullah 🌙\n\nAsk me any Islamic question about Quran, salah, halal guidance, manners, marriage, family, work, inheritance, studies, community, and daily spiritual life.\n\nFor serious fatwa matters, please confirm with a qualified scholar.',
    },
  ]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const generateAnswer = (question: string) => {
    const lower = question.toLowerCase();

    const key = Object.keys(ANSWERS).find(item =>
      lower.includes(item)
    );

    if (key) return ANSWERS[key];

    if (
      lower.includes('allowed') ||
      lower.includes('permissible') ||
      lower.includes('can i') ||
      lower.includes('is it okay')
    ) {
      return (
        'This may need a careful Islamic ruling. The safest approach is to check Quran and authentic Sunnah, avoid doubtful matters, consider harm and benefit, and ask a qualified scholar for the exact case.\n\nGeneral guidance: choose what protects your deen, heart, dignity, wealth, body, and family.'
      );
    }

    if (
      lower.includes('how') ||
      lower.includes('what') ||
      lower.includes('why') ||
      lower.includes('when') ||
      lower.includes('explain')
    ) {
      return (
        'This is a thoughtful question. Islam teaches us to answer with sincerity, knowledge, mercy, and wisdom.\n\nA balanced Islamic direction is:\n\n1. Begin with Allah’s guidance.\n2. Choose what protects your faith and character.\n3. Avoid harm, injustice, and doubtful matters.\n4. Act with patience, honesty, and modesty.\n5. Ask qualified scholars when the matter is serious or detailed.\n\nYou can ask me more specifically and I will guide you step by step.'
      );
    }

    return (
      'Thank you for asking. A helpful Islamic reminder is to keep your heart connected to Allah, protect your salah, speak with good manners, choose halal, avoid harm, and seek beneficial knowledge.\n\nFor specific rulings, please consult a qualified scholar because details matter in Islamic law.'
    );
  };

  const addAnswer = async (question: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: question,
    };

    const history = messages.slice(-10);
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setCategoryQuestion('');
    setLoading(true);

    let answerText: string;
    try {
      const { data } = await api.post('/ai/ask', { question, history });
      answerText = data.success && data.answer ? data.answer : generateAnswer(question);
    } catch {
      // No key configured yet, offline, or request failed — degrade to the
      // built-in answer bank instead of leaving the user with nothing.
      answerText = generateAnswer(question);
    }

    const assistantMessage: Message = {
      id: `${Date.now()}-assistant`,
      role: 'assistant',
      text: answerText,
    };

    setMessages(prev => [...prev, assistantMessage]);
    setLoading(false);

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  const sendMessage = (customQuestion?: string) => {
    const question = customQuestion || input.trim();

    if (!question) {
      Alert.alert(
        'Ask a Question',
        'Please type your Islamic question first.'
      );
      return;
    }

    setScreen('assistant');
    addAnswer(question);
  };

  const sendCategoryQuestion = () => {
    const question = categoryQuestion.trim();

    if (!question) {
      Alert.alert(
        'Ask a Question',
        'Please type your question first.'
      );
      return;
    }

    setScreen('assistant');
    addAnswer(question);
  };

  const openCategory = (category: Category) => {
    setActiveCategory(category);
    setCategoryQuestion('');
    setScreen('category');
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'reset',
        role: 'assistant',
        text:
          'Assalamu Alaikum 🌙\n\nI am ready again. Ask me any Islamic question.',
      },
    ]);
  };

  const renderHero = () => (
    <LinearGradient
      colors={['#032D22', '#064E3B', '#0D7054']}
      style={styles.hero}
    >
      <View style={styles.heroPatternOne} />
      <View style={styles.heroPatternTwo} />
      <View style={styles.heroPatternThree} />

      <View style={styles.heroBadge}>
        <Sparkles size={12} color="#D8B85A" />

        <Text style={styles.heroBadgeText}>
          {greeting} • Islamic Assistant
        </Text>
      </View>

      <View style={styles.heroIcon}>
        <Bot size={34} color="#D8B85A" />
      </View>

      <Text style={styles.heroTitle}>
        AI Islamic Assistant
      </Text>

      <Text style={styles.heroSubtitle}>
        Ask questions separately, or open professional Islamic guidance cards.
      </Text>
    </LinearGradient>
  );

  const renderMiniAskBox = (title: string) => (
    <LinearGradient
      colors={['#064E3B', '#0D7054']}
      style={styles.miniAskBox}
    >
      <View style={styles.miniAskTop}>
        <MessageCircle size={17} color="#D8B85A" />

        <Text style={styles.miniAskTitle}>
          {title}
        </Text>
      </View>

      <Text style={styles.miniAskSub}>
        Ask a question about this topic and continue inside the AI chat.
      </Text>

      <View style={styles.miniInputBox}>
        <TextInput
          style={styles.miniInput}
          value={categoryQuestion}
          onChangeText={setCategoryQuestion}
          placeholder="Type your Islamic question..."
          placeholderTextColor="#8A8172"
          multiline
          scrollEnabled
        />

        <TouchableOpacity
          style={styles.miniSendButton}
          onPress={sendCategoryQuestion}
        >
          <Send size={17} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderHome = () => (
    <>
      {renderHero()}

      <TouchableOpacity
        style={styles.askMainCard}
        activeOpacity={0.9}
        onPress={() => setScreen('assistant')}
      >
        <LinearGradient
          colors={['#FFFDF8', '#F6EFE2']}
          style={styles.askMainInner}
        >
          <View style={styles.askCardGlow} />

          <View style={styles.askIcon}>
            <MessageCircle size={24} color="#D8B85A" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.askTitle}>
              Ask AI Islamic Questions
            </Text>

            <Text style={styles.askSub}>
              Ask about worship, Quran, manners, halal guidance, family, work, studies, and daily life.
            </Text>
          </View>

          <Send size={18} color="#064E3B" />
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.pageTitle}>
        Professional Islamic Guidance Library
      </Text>

      <View style={styles.categoryGrid}>
        {CATEGORIES.map(item => {
          const Icon = item.icon;

          return (
            <TouchableOpacity
              key={item.title}
              style={styles.categoryCard}
              activeOpacity={0.88}
              onPress={() => openCategory(item)}
            >
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: item.color },
                ]}
              >
                <Icon size={18} color="#D8B85A" />
              </View>

              <Text style={styles.categoryTitle}>
                {item.title}
              </Text>

              <Text style={styles.categorySub}>
                {item.subtitle}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <LinearGradient
        colors={['#FFFDF8', '#F6EFE2']}
        style={styles.quickCard}
      >
        <View style={styles.sectionHeader}>
          <Star size={16} color="#9A6A16" />

          <Text style={styles.sectionTitle}>
            Quick Questions
          </Text>
        </View>

        <View style={styles.quickWrap}>
          {QUICK_QUESTIONS.map(question => (
            <TouchableOpacity
              key={question}
              style={styles.quickPill}
              // eslint-disable-next-line react-hooks/rules-of-hooks
              onPress={() => sendMessage(question)}
            >
              <Text style={styles.quickText}>
                {question}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>
    </>
  );

  const renderCategory = () => {
    if (!activeCategory) return null;

    const Icon = activeCategory.icon;

    return (
      <>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setScreen('home')}
        >
          <ChevronLeft size={18} color="#064E3B" />

          <Text style={styles.backText}>
            Back
          </Text>
        </TouchableOpacity>

        <LinearGradient
          colors={['#FFFDF8', '#F6EFE2']}
          style={styles.detailCard}
        >
          <View
            style={[
              styles.detailIcon,
              { backgroundColor: activeCategory.color },
            ]}
          >
            <Icon size={28} color="#D8B85A" />
          </View>

          <Text style={styles.detailTitle}>
            {activeCategory.title}
          </Text>

          <Text style={styles.detailIntro}>
            {activeCategory.intro}
          </Text>

          {activeCategory.sections.map(section => (
            <View
              key={section.heading}
              style={styles.infoBlock}
            >
              <View style={styles.sectionHeader}>
                <Lightbulb size={15} color="#9A6A16" />

                <Text style={styles.infoHeading}>
                  {section.heading}
                </Text>
              </View>

              {section.points.map((point, index) => (
                <View
                  key={point}
                  style={styles.tipRow}
                >
                  <View style={styles.tipNumber}>
                    <Text style={styles.tipNumberText}>
                      {index + 1}
                    </Text>
                  </View>

                  <Text style={styles.tipText}>
                    {point}
                  </Text>
                </View>
              ))}
            </View>
          ))}

          <Text style={styles.miniTitle}>
            Ask About This
          </Text>

          <View style={styles.quickWrap}>
            {activeCategory.questions.map(question => (
              <TouchableOpacity
                key={question}
                style={styles.quickPill}
                onPress={() => sendMessage(question)}
              >
                <Text style={styles.quickText}>
                  {question}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>
      </>
    );
  };

  const renderAssistant = () => (
    <>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setScreen('home')}
      >
        <ChevronLeft size={18} color="#064E3B" />

        <Text style={styles.backText}>
          Back
        </Text>
      </TouchableOpacity>

      <LinearGradient
        colors={['#FFFDF8', '#F7F0DC']}
        style={styles.chatCard}
      >
        <View style={styles.chatHeader}>
          <View style={styles.chatHeaderLeft}>
            <Bot size={18} color="#064E3B" />

            <Text style={styles.chatTitle}>
              Ask Any Islamic Question
            </Text>
          </View>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearChat}
          >
            <RefreshCw size={14} color="#8B1E1E" />

            <Text style={styles.clearText}>
              Reset
            </Text>
          </TouchableOpacity>
        </View>

        {messages.map(message => {
          const isUser = message.role === 'user';

          return (
            <View
              key={message.id}
              style={[
                styles.messageRow,
                isUser && styles.messageRowUser,
              ]}
            >
              {!isUser && (
                <View style={styles.avatar}>
                  <Moon size={15} color="#D8B85A" />
                </View>
              )}

              <View
                style={[
                  styles.messageBubble,
                  isUser
                    ? styles.userBubble
                    : styles.assistantBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isUser
                      ? styles.userText
                      : styles.assistantText,
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            </View>
          );
        })}

        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#064E3B" />

            <Text style={styles.loadingText}>
              Preparing a thoughtful Islamic answer...
            </Text>
          </View>
        )}
      </LinearGradient>

      
    </>
  );

  const activeInputValue =
    screen === 'category' ? categoryQuestion : input;

  const activeInputSetter =
    screen === 'category' ? setCategoryQuestion : setInput;

  const activeInputPlaceholder =
    screen === 'category'
      ? `Ask about ${activeCategory?.title || 'this topic'}...`
      : 'Ask any Islamic question...';

  const handleBottomSend = () => {
    if (screen === 'category') {
      sendCategoryQuestion();
      return;
    }

    sendMessage();
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['left', 'right', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.container}
          contentContainerStyle={[
            styles.content,
            (screen === 'assistant' || screen === 'category') &&
              styles.contentWithInput,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topGlow} />
          <View style={styles.goldGlow} />

          {screen === 'home' && renderHome()}
          {screen === 'category' && renderCategory()}
          {screen === 'assistant' && renderAssistant()}
        </ScrollView>

        {(screen === 'assistant' || screen === 'category') && (
          <View style={styles.inputArea}>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInput}
                placeholder={activeInputPlaceholder}
                placeholderTextColor="#8A8172"
                value={activeInputValue}
                onChangeText={activeInputSetter}
                multiline
                scrollEnabled
              />

              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleBottomSend}
              >
                <Send size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4EFE5',
    paddingTop: 36,
  },

  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 26,
  },
  contentWithInput: {
    paddingBottom: 18,
  },

  topGlow: {
    position: 'absolute',
    top: -10,
    right: -85,
    width: 235,
    height: 235,
    borderRadius: 999,
    backgroundColor: '#D4A017',
    opacity: 0.13,
  },

  goldGlow: {
    position: 'absolute',
    top: 390,
    left: -85,
    width: 195,
    height: 195,
    borderRadius: 999,
    backgroundColor: '#0B5D3B',
    opacity: 0.08,
  },

  hero: {
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 9,
    overflow: 'hidden',
    shadowColor: '#021F18',
  shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 3,
  },

  heroPatternOne: {
    position: 'absolute',
    top: -58,
    right: -40,
    width: 175,
    height: 175,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.075)',
  },

  heroPatternTwo: {
    position: 'absolute',
    bottom: -86,
    left: -55,
    width: 205,
    height: 205,
    borderRadius: 999,
    backgroundColor: 'rgba(216,184,90,0.13)',
  },

  heroPatternThree: {
    position: 'absolute',
    top: 38,
    left: -80,
    width: 130,
    height: 130,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.11)',
  },

  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },

  heroBadgeText: {
    color: '#D8B85A',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 6,
  },

  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(216,184,90,0.55)',
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },

  heroSubtitle: {
    color: '#DDF5EA',
    fontSize: 10.5,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 5,
    fontWeight: '600',
  },

  askMainCard: {
    marginBottom: 10,
    shadowColor: '#5E4515',
  shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },

  askMainInner: {
    borderRadius: 18,
    paddingVertical: 9,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5D9C3',
    overflow: 'hidden',
  },

  askCardGlow: {
    position: 'absolute',
    right: -35,
    top: -35,
    width: 115,
    height: 115,
    borderRadius: 999,
    backgroundColor: '#D8B85A',
    opacity: 0.11,
  },

  askIcon: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: '#064E3B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  askTitle: {
    color: '#032D22',
    fontSize: 15,
    fontWeight: '900',
  },

  askSub: {
    color: '#746A5D',
    fontSize: 10.8,
    lineHeight: 16,
    marginTop: 4,
    fontWeight: '600',
  },

  pageTitle: {
    color: '#032D22',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
    marginBottom: 14,
    letterSpacing: 0.2,
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  categoryCard: {
    width: '48.2%',
    backgroundColor: '#FFFDF8',
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 9,
    marginBottom: 7,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    shadowColor: '#5E4515',
  shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },

  categoryIcon: {
    width: 27,
    height: 27,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },

  categoryTitle: {
    color: '#032D22',
    fontSize: 12,
    fontWeight: '900',
  },

  categorySub: {
    color: '#746A5D',
    fontSize: 9.8,
    lineHeight: 14.5,
    marginTop: 4,
    fontWeight: '600',
  },

  quickCard: {
    borderRadius: 17,
    paddingVertical: 9,
    paddingHorizontal: 9,
    marginTop: 2,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    shadowColor: '#5E4515',
  shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  sectionTitle: {
    color: '#032D22',
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 7,
  },

  quickWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  quickPill: {
    backgroundColor: '#E6F1EC',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 7,
    marginRight: 5,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#CFE4DA',
  },

  quickText: {
    color: '#064E3B',
    fontSize: 10.5,
    fontWeight: '800',
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF8',
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginTop: 12,
    marginBottom: 18,
    shadowColor: '#5E4515',
  shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },

  backText: {
    color: '#064E3B',
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 4,
  },

  detailCard: {
    borderRadius: 19,
    paddingVertical: 13,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 11,
    shadowColor: '#5E4515',
  shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },

  detailIcon: {
    width: 62,
    height: 62,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },

  detailTitle: {
    color: '#032D22',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },

  detailIntro: {
    color: '#5F554B',
    fontSize: 12.2,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 14,
    fontWeight: '600',
  },

  infoBlock: {
    marginTop: 12,
  },

  infoHeading: {
    color: '#064E3B',
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 7,
  },

  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFDF8',
    borderRadius: 10,
    padding: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: '#064E3B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  tipNumberText: {
    color: '#D8B85A',
    fontSize: 10,
    fontWeight: '900',
  },

  tipText: {
    flex: 1,
    color: '#4B4036',
    fontSize: 11.3,
    lineHeight: 17.5,
    fontWeight: '600',
  },

  miniTitle: {
    color: '#064E3B',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 14,
    marginBottom: 8,
  },

  miniAskBox: {
    borderRadius: 22,
    padding: 14,
    marginTop: 16,
  },

  miniAskTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },

  miniAskTitle: {
    color: '#D8B85A',
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 7,
  },

  miniAskSub: {
    color: '#E7F8F0',
    fontSize: 10.8,
    lineHeight: 16,
    fontWeight: '600',
    marginBottom: 11,
  },
  miniInputBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFDF8',
    borderRadius: 20,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 7,
    minHeight: 54,
  },
  miniInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    color: '#032D22',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    paddingTop: 8,
    paddingBottom: 8,
    textAlignVertical: 'top',
  },

  miniSendButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#064E3B',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 7,
  },

  chatCard: {
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 9,
    minHeight: 410,
    shadowColor: '#5E4515',
  shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
  },

  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  chatTitle: {
    color: '#032D22',
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 7,
  },

  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5E7E7',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },

  clearText: {
    color: '#8B1E1E',
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 5,
  },

  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 11,
  },

  messageRowUser: {
    justifyContent: 'flex-end',
  },

  avatar: {
    width: 31,
    height: 31,
    borderRadius: 999,
    backgroundColor: '#064E3B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  messageBubble: {
    maxWidth: '81%',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },

  assistantBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5D9C3',
    borderBottomLeftRadius: 6,
  },

  userBubble: {
    backgroundColor: '#064E3B',
    borderBottomRightRadius: 6,
  },

  messageText: {
    fontSize: 12.3,
    lineHeight: 20,
    fontWeight: '600',
  },

  assistantText: {
    color: '#26352F',
  },

  userText: {
    color: '#FFFFFF',
  },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F1EC',
    padding: 11,
    borderRadius: 16,
    marginTop: 5,
  },

  loadingText: {
    color: '#064E3B',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 8,
  },

  disclaimerBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFDF8',
    borderRadius: 20,
    padding: 13,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  disclaimerText: {
    flex: 1,
    color: '#5F554B',
    fontSize: 10.8,
    lineHeight: 17,
    marginLeft: 9,
    fontWeight: '600',
  },
  inputArea: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 14 : 10,
    backgroundColor: '#F4EFE5',
    borderTopWidth: 1,
    borderTopColor: '#E5D9C3',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#DCCFB9',
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 7,
    minHeight: 58,
    shadowColor: '#5E4515',
  shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    maxHeight: 130,
    minHeight: 42,
    color: '#032D22',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    paddingTop: 8,
    paddingBottom: 8,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#064E3B',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 7,
  },

});