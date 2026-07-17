import { useQuery } from '@tanstack/react-query';

import AtpTourLogo from '../../assets/logos/atp-tour.svg?react';
import Button from '../../components/ui/button';
import Link from '../../components/ui/link';
import Page from '../../components/page';
import {
	ODDSET_PIPELINE_QUERY_KEY,
	ODDSET_PIPELINE_REFRESH_INTERVAL_MS,
	fetchOddsetPipelineSnapshot,
	splitOddsetRowsByStatus
} from '../../js/oddset-pipeline.js';
import { useSQL } from '../../js/vitel.js';

const RECENT_RESULTS_CACHE_MS = 30 * 60 * 1000;

function FeedHeader({ label, action }) {
	return (
		<div className='flex items-center justify-between gap-3 border-b-2 border-primary-800 pb-2 dark:border-primary-300'>
			<h2 className='text-xs font-bold uppercase tracking-[0.18em] text-primary-800 dark:text-primary-200'>{label}</h2>
			{action}
		</div>
	);
}

function MatchStory({ match, live = false, lead = false }) {
	return (
		<article className='grid gap-2 border-b border-primary-300 py-4 last:border-b-0 dark:border-primary-700 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-5'>
			<div className='flex items-center gap-2 self-start text-xs font-bold uppercase tracking-wide text-primary-500 dark:text-primary-400 sm:pt-1'>
				{live ? <span className='h-2 w-2 animate-pulse rounded-full bg-red-500' aria-hidden='true' /> : null}
				{live ? 'Live' : match.start}
			</div>
			<div className='min-w-0'>
				<div className={`${lead ? 'text-2xl sm:text-3xl' : 'text-lg'} font-semibold leading-tight text-primary-900 dark:text-primary-100`}>
					{match.playerAName} <span className='font-normal text-primary-400'>mot</span> {match.playerBName}
				</div>
				<div className='mt-1 text-sm text-primary-600 dark:text-primary-400'>
					{match.turnering}{live && match.liveScore !== '-' ? <span> · {match.liveScore}</span> : null}
				</div>
			</div>
		</article>
	);
}

function getResultHeadline(result, index) {
	switch (index % 3) {
		case 0:
			return <><Link to={`/player/${result.winner_id}`}>{result.winner}</Link> är mästare i <Link to={`/event/${result.event_id}`}>{result.event_name}</Link></>;
		case 1:
			return <><Link to={`/event/${result.event_id}`}>{result.event_name}</Link> fick en ny mästare: <Link to={`/player/${result.winner_id}`}>{result.winner}</Link></>;
		default:
			return <><Link to={`/player/${result.winner_id}`}>{result.winner}</Link> tog titeln efter finalseger mot <Link to={`/player/${result.loser_id}`}>{result.loser}</Link></>;
	}
}

function ResultStory({ result, index = 0, lead = false }) {
	const date = new Date(result.event_date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });

	return (
		<article className='grid gap-2 border-b border-primary-300 py-4 last:border-b-0 dark:border-primary-700 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-5'>
			<div className='self-start text-xs font-bold uppercase tracking-wide text-primary-500 dark:text-primary-400 sm:pt-1'>{date}</div>
			<div className='min-w-0'>
				<div className={`${lead ? 'text-2xl' : 'text-lg'} font-semibold leading-tight text-primary-900 dark:text-primary-100`}>
					{getResultHeadline(result, index)}
				</div>
				<div className='mt-1 text-sm text-primary-600 dark:text-primary-400'>
					Final: <Link to={`/player/${result.winner_id}`}>{result.winner}</Link> mot <Link to={`/player/${result.loser_id}`}>{result.loser}</Link>
					{result.score ? <span> · {result.score}</span> : null}
				</div>
			</div>
		</article>
	);
}

function getUpsetHeadline(upset, index) {
	if (upset.round === 'F') {
		return <><Link to={`/player/${upset.winner_id}`}>{upset.winner}</Link> fullbordade skrällen i finalen</>;
	}

	if (['SF', 'QF'].includes(upset.round)) {
		return <><Link to={`/player/${upset.winner_id}`}>{upset.winner}</Link> slog ut <Link to={`/player/${upset.loser_id}`}>{upset.loser}</Link> ur <Link to={`/event/${upset.event_id}`}>{upset.event_name}</Link></>;
	}

	switch (index % 5) {
		case 0:
			return <><Link to={`/player/${upset.winner_id}`}>{upset.winner}</Link> slog ut <Link to={`/player/${upset.loser_id}`}>{upset.loser}</Link> trots rankinggapet</>;
		case 1:
			return <><Link to={`/player/${upset.loser_id}`}>{upset.loser}</Link> föll mot rank {upset.winner_rank}</>;
		case 2:
			return <>Rank {upset.winner_rank} vann – <Link to={`/player/${upset.winner_id}`}>{upset.winner}</Link> vidare i <Link to={`/event/${upset.event_id}`}>{upset.event_name}</Link></>;
		case 3:
			return <><Link to={`/player/${upset.winner_id}`}>{upset.winner}</Link> trotsade rankingen mot <Link to={`/player/${upset.loser_id}`}>{upset.loser}</Link></>;
		default:
			return <><Link to={`/player/${upset.winner_id}`}>{upset.winner}</Link> satte stopp för <Link to={`/player/${upset.loser_id}`}>{upset.loser}</Link></>;
	}
}

function UpsetStory({ upset, index = 0, lead = false }) {
	const date = new Date(upset.event_date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
	const rankingStory = `Rankad ${upset.winner_rank} slog rank ${upset.loser_rank}`;

	return (
		<article className='border-b border-primary-300 py-4 last:border-b-0 dark:border-primary-700'>
			<div className='text-[11px] font-bold uppercase tracking-[0.14em] text-primary-500 dark:text-primary-400'>
				{date} · {upset.event_name} · {upset.round}
			</div>
			<div className={`${lead ? 'text-2xl' : 'text-lg'} mt-1 font-semibold leading-tight text-primary-900 dark:text-primary-100`}>
				{getUpsetHeadline(upset, index)}
			</div>
			<div className='mt-1 text-sm text-primary-600 dark:text-primary-400'>
				{rankingStory}{upset.score ? <span> · {upset.score}</span> : null}
			</div>
		</article>
	);
}

function OverviewPage() {
	const {
		data: oddsetSnapshot,
		error: matchError,
		isFetching: isFetchingMatches
	} = useQuery({
		queryKey: [ODDSET_PIPELINE_QUERY_KEY],
		queryFn: fetchOddsetPipelineSnapshot,
		staleTime: ODDSET_PIPELINE_REFRESH_INTERVAL_MS,
		refetchInterval: ODDSET_PIPELINE_REFRESH_INTERVAL_MS,
		refetchIntervalInBackground: false,
		refetchOnWindowFocus: false,
		retry: 0,
		placeholderData: previousData => previousData
	});
	const { data: overviewStories, error: resultsError, isFetching: isFetchingResults } = useSQL({
		sql: `
			SELECT event_date, event_id, event_name, winner, winner_id, loser, loser_id, score
			FROM flatly
			WHERE round = 'F'
				AND event_type <> 'Challenger'
				AND event_date <= CURRENT_DATE
			ORDER BY event_date DESC, event_name ASC
			LIMIT 6;

			SELECT event_date, event_id, event_name, round,
				winner, winner_id, winner_rank, loser, loser_id, loser_rank, score
			FROM flatly
			WHERE event_type <> 'Challenger'
				AND event_date <= CURRENT_DATE
				AND event_date >= CURRENT_DATE - INTERVAL 120 DAY
				AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128', 'RR')
				AND winner_rank IS NOT NULL
				AND loser_rank IS NOT NULL
				AND winner_rank >= loser_rank + 20
			ORDER BY event_date DESC, (winner_rank - loser_rank) DESC
			LIMIT 5
		`,
		cache: RECENT_RESULTS_CACHE_MS,
		placeholderData: previousResults => previousResults
	});
	const recentResults = overviewStories?.[0];
	const recentUpsets = overviewStories?.[1];
	const { liveMatches, upcomingMatches } = splitOddsetRowsByStatus(oddsetSnapshot?.oddsetRows ?? []);
	const featuredMatches = (liveMatches.length > 0 ? liveMatches : upcomingMatches).slice(0, 4);
	const isInitialLoading = !oddsetSnapshot && !matchError;
	const hasWarning = Boolean(matchError || resultsError);
	const status = hasWarning ? 'warning' : (isFetchingMatches || isFetchingResults ? 'loading' : 'ready');
	const statusMessage = hasWarning
		? 'Översikten visas, men allt kunde inte uppdateras just nu.'
		: isFetchingMatches || isFetchingResults
			? 'Uppdaterar tennisvärlden…'
			: `Översikten är aktuell · ${liveMatches.length} live och ${upcomingMatches.length} kommande matcher.`;

	return (
		<Page id='overview-page'>
			<Page.Menu />
			<Page.Content>
				<Page.Title className='flex items-center gap-5'>
					<AtpTourLogo fill='currentColor' className='h-10 bg-transparent' />
					<span className='bg-transparent'>Tennisvärlden</span>
				</Page.Title>

				<Page.Container className='space-y-8'>
					<section>
						<FeedHeader
							label={liveMatches.length > 0 ? 'Händer nu' : 'Härnäst'}
							action={<Button link={liveMatches.length > 0 ? '/scoreboard' : '/matches'} size='compact'>{liveMatches.length > 0 ? 'Scoreboard' : 'Alla matcher'}</Button>}
						/>
							{isInitialLoading ? (
								<div className='py-8 text-sm text-primary-500'>Hämtar matchläget…</div>
							) : featuredMatches.length > 0 ? (
								featuredMatches.map((match, index) => <MatchStory key={match.id} match={match} live={liveMatches.length > 0} lead={index === 0} />)
							) : (
								<div className='py-8 text-sm text-primary-500'>Lugnt på touren just nu.</div>
							)}
					</section>

					<div className='space-y-8'>
						<section>
							<FeedHeader label='Senaste resultaten' action={<Button link='/events' size='compact'>Turneringar</Button>} />
							{!recentResults && !resultsError ? (
								<div className='py-8 text-sm text-primary-500'>Hämtar resultat…</div>
							) : recentResults?.length > 0 ? (
								recentResults.map((result, index) => <ResultStory key={`${result.event_id}-${result.winner_id}`} result={result} index={index} lead={index === 0} />)
							) : (
								<div className='py-8 text-sm text-primary-500'>Inga nya finalresultat ännu.</div>
							)}
						</section>

						<section>
							<FeedHeader label='Skrällar' />
							{!recentUpsets && !resultsError ? (
								<div className='py-8 text-sm text-primary-500'>Letar skrällar…</div>
							) : recentUpsets?.length > 0 ? (
								recentUpsets.map((upset, index) => <UpsetStory key={`${upset.event_id}-${upset.winner_id}-${upset.loser_id}`} upset={upset} index={index} lead={index === 0} />)
							) : (
								<div className='py-8 text-sm text-primary-500'>Inga färska skrällar i huvudtouren.</div>
							)}
						</section>
					</div>

					<footer className='flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-primary-300 pt-4 text-sm font-semibold dark:border-primary-700'>
						<Link to='/matches'>Hela matchläget →</Link>
						<a href='https://www.atptour.com/en/news' target='_blank' rel='noreferrer' className='hover:opacity-60'>Senaste nytt från ATP ↗</a>
					</footer>
				</Page.Container>
			</Page.Content>
			<Page.StatusBar status={status}>{statusMessage}</Page.StatusBar>
		</Page>
	);
}

export default OverviewPage;
