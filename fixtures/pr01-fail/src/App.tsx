import { BrowserRouter, Route, Routes } from 'react-router-dom';

/**
 * Known-bad фікстура PR01: навмисно неповна робота студента рівно на 40/80.
 *
 * Реалізовано: `/`, `/projects`, контрольований `/projects/` і доступна навігація.
 * Свідомо відсутнє: маршрут `/projects/:projectId`, catch-all 404 та клієнтські
 * переходи — посилання зроблено звичайними <a href>, тому маршрут змінює лише
 * повне перезавантаження сторінки.
 *
 * Якщо фікстура колись почне проходити п'яту поведінку — послаблюємо фікстуру,
 * а не набір тестів.
 */

const PROJECTS = [
  { id: 'onboarding', title: 'Онбординг команди' },
  { id: 'analytics', title: 'Аналітика продукту' },
  { id: 'mobile-app', title: 'Мобільний застосунок' },
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
            <a href={`/projects/${project.id}`}>{project.title}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header>
          <nav aria-label="Основна навігація">
            <a href="/">Головна</a>
            <a href="/projects">Проєкти</a>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
