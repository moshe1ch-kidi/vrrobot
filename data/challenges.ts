import { RobotState } from '../types';

export interface Challenge {
    id: string;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    check: (startState: RobotState, endState: RobotState, history: SimulationHistory) => boolean;
}

export interface SimulationHistory {
    maxDistanceMoved: number;
    touchedWall: boolean;
    detectedColors: string[];
    totalRotation: number;
}

export const CHALLENGES: Challenge[] = [
    // --- GROUP 1: BASICS ---
    {
        id: 'c1',
        title: 'כיוונים - ניווט בחדר',
        description: 'סע 1 מטר קדימה, פנה ימינה ב-90 מעלות וסע עוד חצי מטר.',
        difficulty: 'Easy',
        check: (start, end, history) => history.maxDistanceMoved >= 12 && Math.abs(history.totalRotation) >= 85
    },
    {
        id: 'c2',
        title: 'כיוונים - פנייה במקום',
        description: 'בצע סיבוב של 360 מעלות סביב הציר של הרובוט וחזור לכיוון המקורי.',
        difficulty: 'Easy',
        check: (start, end, history) => Math.abs(history.totalRotation) >= 350
    },
    {
        id: 'c3',
        title: 'מהירות - זינוק בעלייה',
        description: 'הגדר מהירות ל-100% לנסיעה של 2 מטרים וחזרה ב-20% מהירות.',
        difficulty: 'Easy',
        check: (start, end, history) => history.maxDistanceMoved >= 18
    },
    {
        id: 'c4',
        title: 'מהירות - בלימת חירום',
        description: 'סע מהר ועצור בפתאומיות (Hold Position) מבלי להחליק.',
        difficulty: 'Easy',
        check: (start, end, history) => history.maxDistanceMoved > 5 && !end.isMoving
    },
    {
        id: 'c5',
        title: 'נורות - רמזור בקר',
        description: 'הדלק את נורת הבקר בירוק כשנוסעים, ובאדום כשעוצרים.',
        difficulty: 'Easy',
        check: (start, end, history) => end.ledLeftColor.toLowerCase() === 'red' || end.ledRightColor.toLowerCase() === 'red'
    },
    {
        id: 'c6',
        title: 'נורות - פנס איתות',
        description: 'הבהב בנורת הבקר (כתום) למשך 2 שניות לפני שמתחילים פנייה.',
        difficulty: 'Easy',
        check: (start, end, history) => Math.abs(history.totalRotation) > 10 && (end.ledLeftColor !== 'black' || end.ledRightColor !== 'black')
    },
    
    // --- GROUP 2: OBSTACLES ---
    {
        id: 'c7',
        title: 'סלאלום - מסלול מכשולים',
        description: 'עקוף 4 בקבוקים/קונוסים שהנחת על הרצפה במרחק חצי מטר זה מזה.',
        difficulty: 'Medium',
        check: (start, end, history) => history.maxDistanceMoved > 20 && Math.abs(history.totalRotation) > 40
    },
    {
        id: 'c8',
        title: 'סלאלום - הקפה מעגלית',
        description: 'בצע סלאלום סביב חפץ אחד מבלי להוריד ממנו את ה"מבט" של הרובוט.',
        difficulty: 'Medium',
        check: (start, end, history) => history.maxDistanceMoved > 10 && Math.abs(history.totalRotation) > 180
    },

    // --- GROUP 3: SENSORS ---
    {
        id: 'c9',
        title: 'חיישן מגע - פגוש בטיחות',
        description: 'סע עד שהרובוט נוגע ברגל של שולחן, השמע צליל "אוי" וסע לאחור.',
        difficulty: 'Medium',
        check: (start, end, history) => history.touchedWall
    },
    {
        id: 'c10',
        title: 'חיישן מגע - שלט רחוק',
        description: 'השתמש בלחיצה על חיישן המגע כדי להתניע את הרובוט (Start on Press).',
        difficulty: 'Medium',
        check: (start, end, history) => history.maxDistanceMoved > 0
    },
    {
        id: 'c11',
        title: 'זיהוי קווים - עצירה בקו',
        description: 'הנח סרט דביק שחור על הרצפה והגדר לרובוט לעצור בדיוק עליו.',
        difficulty: 'Medium',
        check: (start, end, history) => history.detectedColors.includes('black') && !end.isMoving
    },
    {
        id: 'c12',
        title: 'זיהוי קווים - חציית צומת',
        description: 'תכנת את הרובוט לספור כמה קווים שחורים הוא חוצה בחדר.',
        difficulty: 'Medium',
        check: (start, end, history) => history.detectedColors.includes('black') && history.maxDistanceMoved > 5
    },
    {
        id: 'c21',
        title: 'זיהוי קווים - מעקב קו',
        description: 'השתמש בחיישן הצבע כדי לעקוב אחרי הקו השחור המעגלי. השלם הקפה מלאה.',
        difficulty: 'Hard',
        check: (start, end, history) => {
            return history.maxDistanceMoved > 30 && history.detectedColors.includes('black');
        }
    },
    {
        id: 'c13',
        title: 'זיהוי צבעים - זיהוי חפצים',
        description: 'הנח דפים צבעוניים. על דף כחול הדלק אור כחול, על אדום - אור אדום.',
        difficulty: 'Medium',
        check: (start, end, history) => history.detectedColors.includes('blue') || history.detectedColors.includes('red')
    },
    {
        id: 'c14',
        title: 'זיהוי צבעים - מחסום חכם',
        description: 'הרובוט נוסע עד שהוא מזהה "כרטיס אדום" (דף אדום) ואז מסתובב ובורח.',
        difficulty: 'Hard',
        check: (start, end, history) => (history.detectedColors.includes('red') || history.touchedWall) && Math.abs(history.totalRotation) >= 150
    },
    {
        id: 'c15',
        title: 'אולטרסוניק - שמירת מרחק',
        description: 'סע לעבר קיר ועצור במרחק של בדיוק 10 ס"מ (מדידה עם סרגל).',
        difficulty: 'Hard',
        check: (start, end, history) => !history.touchedWall && history.maxDistanceMoved > 10
    },
    {
        id: 'c16',
        title: 'אולטרסוניק - הימנעות ממכשול',
        description: 'סע קדימה לכיוון הקיר. כאשר החיישן מזהה מרחק קטן מ-20 ס"מ, עצור ופנה הצידה.',
        difficulty: 'Hard',
        check: (start, end, history) => !history.touchedWall && history.maxDistanceMoved > 5 && Math.abs(history.totalRotation) > 45
    },

    // --- GROUP 4: ADVANCED ---
    {
        id: 'c17',
        title: 'גירו (Gyro) - פנייה צבאית',
        description: 'בצע פנייה של בדיוק 90 מעלות. השווה בין פנייה לפי זמן לפנייה לפי גירו.',
        difficulty: 'Hard',
        check: (start, end, history) => {
             const rot = Math.abs(history.totalRotation);
             return rot >= 88 && rot <= 92;
        }
    },
    {
        id: 'c18',
        title: 'גירו (Gyro) - פלס וירטואלי',
        description: 'אם הרובוט נוטה הצידה (מישהו מזיז אותו), הוא יתקן את עצמו חזרה ל-0.',
        difficulty: 'Hard',
        check: (start, end, history) => history.maxDistanceMoved > 5
    },
    {
        id: 'c19',
        title: 'משולב - חניה ברוורס',
        description: 'השתמש באולטרסוניק כדי לא להתקע בקיר ובירו כדי להכנס ישר.',
        difficulty: 'Hard',
        check: (start, end, history) => !history.touchedWall && history.maxDistanceMoved > 10
    },
    {
        id: 'c20',
        title: 'משולב - משימת חילוץ',
        description: 'מצא חפץ בחדר (אולטרסוניק), סע אליו והבהב באורות כשהגעת.',
        difficulty: 'Hard',
        check: (start, end, history) => !history.touchedWall && history.maxDistanceMoved > 10 && end.ledLeftColor !== 'black'
    }
];