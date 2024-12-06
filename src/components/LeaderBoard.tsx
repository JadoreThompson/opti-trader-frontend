import { FC } from 'react';

const LeaderBoard: FC = () => {
    return (
        <div className="container leaderboard-container">
            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Username</th>
                            <th>Earnings</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>TraderKing</td>
                            <td>$50,230</td>
                            <td><button className="btn btn-secondary follow-btn">Follow</button></td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>ProfitHunter</td>
                            <td>$45,120</td>
                            <td><button className="btn btn-secondary follow-btn">Follow</button></td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td>BearSlayer</td>
                            <td>$38,750</td>
                            <td><button className="btn btn-secondary follow-btn">Follow</button></td>
                        </tr>
                        <tr>
                            <td>4</td>
                            <td>BullMaster</td>
                            <td>$30,400</td>
                            <td><button className="btn btn-secondary follow-btn">Follow</button></td>
                        </tr>
                        <tr>
                            <td>5</td>
                            <td>RiskyBets</td>
                            <td>$25,870</td>
                            <td><button className="btn btn-secondary follow-btn">Follow</button></td>
                        </tr>
                        <tr>
                            <td>6</td>
                            <td>ChartWizard</td>
                            <td>$21,540</td>
                            <td><button className="btn btn-secondary follow-btn">Follow</button></td>
                        </tr>
                        <tr>
                            <td>7</td>
                            <td>MarketMaven</td>
                            <td>$19,300</td>
                            <td><button className="btn btn-secondary follow-btn">Follow</button></td>
                        </tr>
                        <tr>
                            <td>8</td>
                            <td>QuickPips</td>
                            <td>$15,120</td>
                            <td><button className="btn btn-secondary follow-btn">Follow</button></td>
                        </tr>
                        <tr>
                            <td>9</td>
                            <td>OptionsGuru</td>
                            <td>$12,800</td>
                            <td><button className="btn btn-secondary follow-btn">Follow</button></td>
                        </tr>
                        <tr>
                            <td>10</td>
                            <td>PennyPincher</td>
                            <td>$9,450</td>
                            <td><button className="btn btn-secondary follow-btn">Follow</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeaderBoard;
