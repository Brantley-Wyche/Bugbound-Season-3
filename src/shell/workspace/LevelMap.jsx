import { getPracticeLevels, recommendChallenge, filterChallenges } from './practice.js';
import { levelHref } from './navigation.js';
import Icon from '../Icon.jsx';
import { Tabs, TabsList, TabsTrigger } from '../../components/motion/tabs';

export default function LevelMap({ levels, completed, collection, lastId, filters, onFiltersChange }) {
  const catalog = getPracticeLevels(levels, collection);
  const suggestion = recommendChallenge(catalog, completed, lastId);
  const recent = catalog.find((level) => level.id === lastId);
  const visible = filterChallenges(catalog, filters, completed);
  const generated = collection === 'generated';
  const openCount = catalog.filter((level) => !completed.has(level.id)).length;
  const changeFilter = (key, value) => onFiltersChange({ ...filters, [key]: value });

  return (
    <main className="practice-page" id="main-content" tabIndex={-1}>
      <div className="practice-heading">
        <h1 id="page-title" tabIndex={-1}>Practice</h1>
        <a href="#/brief" className="btn"><Icon name="plus" /> Brief an incident</a>
      </div>

      <section className="practice-launch" aria-label="Your next investigation">
        <div className="launch-main">
          {suggestion ? (
            <>
              <div className="launch-title"><span className="incident-index">{String(suggestion.level.number).padStart(2, '0')}</span><h2>{suggestion.level.title}</h2></div>
              <p className="suggestion-reason"><strong>Suggested next.</strong> {suggestion.reason}</p>
              <div className="launch-actions">
                <a className="btn btn-primary" href={levelHref(suggestion.level.id)}>Open investigation <Icon name="arrow" /></a>
                <span className="quiet">Every incident is open to choose.</span>
              </div>
            </>
          ) : (
            <>
              <h2>{catalog.length ? 'Every incident here is repaired.' : 'Your lab starts with a brief.'}</h2>
              <p>{catalog.length ? 'Revisit any incident to check your current source, or brief your agent for a new one.' : 'Tell your coding agent what you want to practice. Its generated incidents will appear in this register.'}</p>
              <a className="btn btn-primary" href="#/brief">Prepare an agent brief <Icon name="arrow" /></a>
            </>
          )}
        </div>
        <div className="launch-aside">
          {recent ? (
            <>
              <h3>{completed.has(recent.id) ? 'Last visited' : 'Pick up where you left off'}</h3>
              <p>{recent.title}</p>
              <a className="inline-link" href={levelHref(recent.id)}>{completed.has(recent.id) ? 'Revisit investigation' : 'Continue investigation'} <Icon name="arrow" size={16} /></a>
            </>
          ) : (
            <>
              <Icon name="book" size={26} />
              <h3>Practice with intent.</h3>
              <p>The agent creates the problem. You build the understanding.</p>
              <a className="inline-link" href="#/brief">Brief your next incident <Icon name="arrow" size={16} /></a>
            </>
          )}
        </div>
      </section>

      <section className="challenge-register" aria-labelledby="register-title">
        <div className="register-heading">
          <h2 id="register-title">Incident register</h2>
          <span className="register-count">{openCount} open <span aria-hidden="true">·</span> {catalog.length} available</span>
        </div>
        <div className="register-tools">
          <Tabs value={collection} variant="underline" className="collection-tabs">
            <TabsList navigation className="collection-nav" aria-label="Incident collections">
              <TabsTrigger value="generated" href="#/" indicatorClassName="collection-indicator">Generated <span className="collection-count">{getPracticeLevels(levels, 'generated').length}</span></TabsTrigger>
              <TabsTrigger value="foundations" href="#/foundations" indicatorClassName="collection-indicator">Foundations <span className="collection-count">{getPracticeLevels(levels, 'foundations').length}</span></TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="register-filters">
            <label className="search-field"><Icon name="search" size={17} /><span className="sr-only">Search incidents</span>
              <input type="search" value={filters.query} onChange={(event) => changeFilter('query', event.target.value)} placeholder="Search title or concept…" />
            </label>
            <label className="status-filter"><span className="sr-only">Filter by status</span>
              <select value={filters.status} onChange={(event) => changeFilter('status', event.target.value)}>
                <option value="all">All statuses</option><option value="open">Open</option><option value="completed">Repaired</option>
              </select>
            </label>
          </div>
        </div>
        <p className="collection-description">{generated ? 'Created by your coding agent. Choose freely, at any difficulty.' : 'The original React and TypeScript curriculum, available to revisit in any order.'}</p>
        <div className="register-column-head" aria-hidden="true"><span>Incident</span><span>Title</span><span>Severity</span><span>Status</span><span /></div>
        {visible.length ? (
          <ul className="challenge-list">
            {visible.map((level) => {
              const folio = String(level.number).padStart(2, '0');
              const status = completed.has(level.id) ? 'Repaired' : 'Open';
              return (
                <li key={level.id}>
                  <a className="challenge-row" href={levelHref(level.id)} aria-label={`${folio} ${level.title}. ${level.concept}. ${level.severity} severity. ${status}.`}>
                    <span className="row-id">{folio}</span>
                    <span className="row-subject"><strong>{level.title}</strong><span>{level.concept}</span></span>
                    <span className="row-difficulty">{level.severity}</span>
                    <span className={`row-status ${completed.has(level.id) ? 'is-saved' : ''}`}><span className="state-dot" aria-hidden="true" />{status}</span>
                    <Icon name="arrow" className="row-arrow" />
                  </a>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="register-empty" role="status">
            <h3>{catalog.length ? 'No incidents match these filters.' : 'No generated incidents yet.'}</h3>
            <p>{catalog.length ? 'Try another title or concept, or clear the filters to see the full collection.' : 'Write a brief, hand it to your coding agent, and have it follow the repository’s authoring and verification instructions.'}</p>
            {catalog.length ? <button className="btn" onClick={() => onFiltersChange({ query: '', status: 'all' })}>Clear filters</button> : <a className="btn" href="#/brief">Brief an incident</a>}
          </div>
        )}
        <p className="register-footnote" aria-live="polite">Showing {visible.length} of {catalog.length} incidents. Repaired records an earlier successful run; a revisit starts unchecked.</p>
      </section>
      <div className="practice-endnote"><Icon name="file" size={20} /><p>New incidents are discovered from your local repository. Have your agent validate them and prove their checks in both directions before you begin.</p></div>
    </main>
  );
}
