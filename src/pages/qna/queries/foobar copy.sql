/* 

@title 
Grand Slam-titlar per födelsedecennium 

@description
Visar hur många Grand Slam-titlar som totalt har vunnits av spelare födda i respektive decennium, samt antal unika GS-vinnare per decennium. 

*/

WITH slam_titles AS (
    SELECT
        winner_id,
        COUNT(*) AS slam_titles
    FROM flatly
    WHERE event_type = 'Grand Slam'
      AND round = 'F'
      AND winner_id IS NOT NULL
    GROUP BY winner_id
),
players_with_decade AS (
    SELECT
        FLOOR(YEAR(p.birthdate) / 10) * 10 AS birth_decade_start,
        st.slam_titles
    FROM slam_titles st
    JOIN players p ON p.id = st.winner_id
    WHERE p.birthdate IS NOT NULL
)
SELECT
    CONCAT(birth_decade_start, '-talet') AS Fodelsedecennium,
    SUM(slam_titles) AS Totala_GS_titlar,
    COUNT(*) AS Antal_GS_vinnare
FROM players_with_decade
GROUP BY birth_decade_start
ORDER BY birth_decade_start;