import React, { useEffect, useState } from "react";
import "./ethics.css";

// menu not working properly

export default function Ethics() {
  const [menuItems, setMenuItems] = useState([]);
  useEffect(() => {
    const sectionTitles = Array.from(
      document.querySelectorAll(".ethics--section")
    ).map((title) => title.textContent);
    setMenuItems(sectionTitles);
  }, []);
  const handleMenuItemClick = (event) => {
    event.preventDefault();
    const sectionId = event.target.getAttribute("href");
    const section = document.querySelector(sectionId);
    section.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div>
      <div className="ethics">
        <div className="ethics--menu">
          {menuItems.map((title, index) => (
            <p>
              <a
                className="ethics--menu--links"
                href={`#section${index + 1}`}
                key={title}
                onClick={handleMenuItemClick}
              >
                {title}
              </a>
            </p>
          ))}
        </div>

        <div className="ethics--container">
          <div className="ethics--content">
            <h1>Ethics and Anonymisation</h1>
            <div>
              <h3>
                Votes are anonymous. Votes are not connected to a voter, nor
                even to a unique voting token.
              </h3>
              <p>
                IASC ensures that each targeted scientist can only vote once, by
                linking each vote to a unique voting token. As each token is
                used (a targeted participant votes), the IASC server deletes
                that token from its storage. If anyone tries to vote a second
                time, using that same token, the absence of that token from the
                server is used to block the attempt. When a vote takes place,
                the vote itself is recorded in one place (a spreadsheet), whilst
                the fact that a given targeted scientist has voted is recorded
                in another place, in effect, by the fact that the unique voting
                token assigned to that scientist is erased from the IASC server.
              </p>
              <p>
                Thus, during the two weeks that the survey is open (but not
                after), it is possible in principle to establish whether or not
                a given targeted scientist has voted, by ascertaining whether or
                not their voting token has been erased from the server. Two
                points are important here:
              </p>
              <ol>
                <li>
                  It still isn’t possible to ascertain how the scientist voted,
                  except in edge-cases such as when only one targeted scientist
                  participates, or when all scientists vote the same way;
                </li>
                <li>
                  After two weeks, when the survey closes, all voting tokens are
                  erased from the IASC server, whether they have been used or
                  not.
                </li>
              </ol>
              <p>
                Thus, at the moment the survey closes, after two weeks, it
                becomes impossible to ascertain even if a targeted scientist
                participated, never mind how they voted. Again, there are
                edge-cases, such as when the response rate is 100%, and all
                scientists vote the same way. If this were to happen, we would
                know how every scientist voted. Such cases are vanishingly
                unlikely; we expect a response rate between 40% and
                (optimistically) 70%. A 100% response rate is unthinkable, and
                we include it here only because it is logically possible.
              </p>
              <p>
                Concerning the data collected, IASC records and retain some key
                pieces of demographic information for research purposes.
                Responses are tagged with type of scientist (broadly construed),
                and institution, for example that the vote-caster was a chemist
                residing at Durham University (UK). For the purposes of this
                system, scientists are put into five categories: Physics,
                Chemistry, Biology, Earth Sciences, and Health Sciences. We
                balance aggregation of data with the necessity to satisfy
                statistical queries about voter demographics.
              </p>

              <h3>FOI Request</h3>
              <p>
                A Freedom of Information Request (FOI) can be issued to a public
                institution, such as a university, by anyone at any time. In
                theory, during the two weeks that the survey is ‘live’, an FOI
                request could be submitted in an attempt to find out if a
                scientist did/did not participate.
              </p>
              <p>
                During these two weeks (but not after), such information is, in
                principle, available, since a unique voting link is assigned to
                each targeted scientist, and the server records which links have
                been used by deleting them as they are used. (N.B. Even during
                these two weeks there is no way to link a participant with their
                vote, since this information isn’t recorded by IASC. A possible
                edge-case exception is when all participants respond in the same
                way. In that case, knowing if a scientist voted is sufficient to
                know how they voted. However, with our expected response rate
                and the number of targeted scientists, this is an unlikely
                scenario).
              </p>
              <p>
                However, various exemptions are listed in the Freedom of
                Information Act: for example, a request can be refused if it
                would disclose personal information in contravention of the UK
                Data Protection Act 2018, or the General Data Protection
                Regulation (GDPR). This must be balanced against the Public
                Interest Test, or PIT: an exemption can only hold if it is not
                in the public interest to release that data.
              </p>
              <p>
                GDPR would provide protection against this, as the responses of
                individuals could be argued to be their personal data, which as
                the data controller we would be unable to release. It would be
                difficult to argue that it is in the public interest to reveal
                information about how any given individual voted, and it would
                likely be allowable to release summary information
                (demographics, etc) at an aggregate level to satisfy a FOI
                request.
              </p>

              <h3>Subpoena and Witness Summons</h3>
              <p>
                A subpoena is a coercive summons issued by a court requiring an
                individual or organisation to produce evidence. Subpoena are
                used in the United States to compel testimony. The 1970 Hague
                Evidence Convention would be the fallback for a lawyer in the
                USA attempting to exfiltrate data from a British company, using
                a witness summons which performs a much narrower discovery
                function than the US subpoena.
              </p>
              <p>
                A witness summons is the equivalent UK process for compelling an
                individual to produce evidence at trial: the word ‘subpoena’ is
                no longer used in UK law. A witness can refuse to comply with a
                witness summons on the grounds that they cannot produce the
                requested evidence, or that they have a duty of confidentiality
                to any person to whom the evidence relates which outweighs the
                reasons for the court summons, warrant, or order.
              </p>
              <p>
                In the case of an IASC survey, an attempted subpoena or witness
                summons would be highly unlikely to be an effective way to
                extract information on survey participants and votes cast. After
                two weeks, when the survey closes, nobody could possibly
                identify whether or not a targeted scientist voted, never mind
                how they voted. (Data is deleted automatically by the polling
                software.) And before two weeks, when the survey is still
                ‘live’, IASC would have a duty of confidentiality to its
                participants which would outweigh any reason for the court
                summons, warrant, or order.
              </p>

              <h3>FAQs</h3>

              <h3>Who can see the data?</h3>
              <p>
                Although the survey invitation emails are sent from various
                different local institutions, the data itself goes directly to
                the project hub (Durham, UK). The spoke representatives in the
                IASC hub-and-spoke network, who send the emails, cannot access
                any data. This includes knowledge of who has/hasn’t chosen to
                participate at their own institution.
              </p>

              <h3>What encryption method is used?</h3>
              <p>Responses are encrypted with an https:// secure connection.</p>

              <h3>Does this project have ethics approval?</h3>
              <p>
                This project has full ethics approval from Durham University
                (UK), equivalent to IRB in the US. A full Data Protection Impact
                Assessment has been undertaken: our basis for processing data
                under GDPR is “Legitimate Interests“, and a Legitimate Interests
                Assessment has been undertaken.
              </p>

              <h3>What will be done with the collected data?</h3>
              <p>
                Data is collected purely for the purposes of ascertaining
                strength of scientific community opinion, regarding a given
                statement of interest.
              </p>

              <h3>
                Why aren’t targeted scientists given the opportunity to
                “unsubscribe”?
              </h3>
              <p>
                Targeted scientists aren’t subscribed to anything. They will be
                emailed only twice during the 2022-23 academic year, with the
                email coming from somebody internal to their own institution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
