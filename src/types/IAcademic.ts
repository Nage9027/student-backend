export interface ISubject {
  _id: string;
  code: string;
  name: string;
  credits: number;
  department: string;
  semester: number;
  teacher: string; // Teacher ID
  coPoMapping: {
    co: string;
    po: string[];
  }[];
}

export interface ICourse {
  _id: string;
  name: string;
  code: string;
  department: string;
  duration: number;
  semesters: number;
  subjects: string[]; // Subject IDs
}

export interface IAttendance {
  _id: string;
  student: string;
  subject: string;
  date: Date;
  status: 'present' | 'absent' | 'leave';
  markedBy: string; // Teacher ID
}

export interface IExam {
  _id: string;
  name: string;
  subject: string;
  date: Date;
  maximumMarks: number;
  type: 'theory' | 'practical' | 'assignment';
  syllabus?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGrade {
  _id: string;
  student: string;
  exam: string;
  subject: string;
  marksObtained: number;
  maximumMarks: number;
  grade: string;
  remarks?: string;
}