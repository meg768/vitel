/* 

@title 
Grand Slam-titlar per födelsedecennium 

@description
Visar hur många Grand Slam-titlar som totalt har vunnits av spelare födda i respektive decennium, samt antal unika Grand Slam-vinnare per decennium. 

*/

WITH slam_titles AS (
    SELECT
        winner_id,
        COUNT(*) AS `Antal Grand Slam-titlar`
    FROM flatly
    WHERE event_type = 'Grand Slam'
      AND round = 'F'
      AND winner_id IS NOT NULL
    GROUP BY winner_id
),
players_with_decade AS (
    SELECT
        FLOOR(YEAR(p.birthdate) / 10) * 10 AS `Decennium Start`,
        st.`Antal Grand Slam-titlar`
    FROM slam_titles st
    JOIN players p ON p.id = st.winner_id
    WHERE p.birthdate IS NOT NULL
)
SELECT
    CONCAT(`Decennium Start`, '-talet') AS `Decennium`,
    SUM(`Antal Grand Slam-titlar`) AS `Totala Grand Slam-titlar`,
    COUNT(*) AS `Antal Grand Slam-vinnare`
FROM players_with_decade
GROUP BY `Decennium Start`
ORDER BY `Decennium Start`;