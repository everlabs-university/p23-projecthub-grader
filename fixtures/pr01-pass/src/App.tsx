import { BrowserRouter, Link, Route, Routes, useParams } from 'react-router-dom';

/** Known-good фікстура PR01: усі вісім видимих поведінок реалізовано, очікується 80/80. */

type Project = {
  id: string;
  title: string;
  summary: string;
};

const PROJECTS: Project[] = [
  {
    id: 'onboarding',
    title: 'Онбординг команди',
    summary: 'Чеклист і матеріали для перших двох тижнів нового розробника.',
  },
  {
    id: 'analytics',
    title: 'Аналітика продукту',
    summary: 'Дашборди активації, утримання та тижневої активної аудиторії.',
  },
  {
    id: 'mobile-app',
    title: 'Мобільний застосунок',
    summary: 'Клієнт для iOS та Android на спільному API ProjectHub.',
  },
];

function HomePage() {
  return (
    <section>
      <h1>ProjectHub</h1>
      <p>Місце, де команда бачить усі свої проєкти в одному списку.</p>
    </section>
  );
}

function ProjectsPage() {
  return (
    <section>
      <h1>Проєкти</h1>
      <ul>
        {PROJECTS.map((project) => (
          <li key={project.id}>
            <Link to={`/projects/${project.id}`}>{project.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProjectDetailPage() {
  const { projectId } = useParams();
  const project = PROJECTS.find((candidate) => candidate.id === projectId);

  if (!project) {
    return (
      <section>
        <h1>Проєкт не знайдено</h1>
        <p>Проєкту з ідентифікатором «{projectId}» немає у списку.</p>
        <Link to="/projects">До списку проєктів</Link>
      </section>
    );
  }

  return (
    <section>
      <h1>{project.title}</h1>
      <p>{project.summary}</p>
      <Link to="/projects">До списку проєктів</Link>
    </section>
  );
}

function NotFoundPage() {
  return (
    <section>
      <h1>404 — сторінку не знайдено</h1>
      <p>Перевірте адресу або поверніться на головну.</p>
      <Link to="/">На головну</Link>
    </section>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header>
          <nav aria-label="Основна навігація">
            <Link to="/">Головна</Link>
            <Link to="/projects">Проєкти</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
