import React, { useContext, useEffect, useState } from "react";
import Select from "react-select";
import CreateableSelect from "react-select/creatable";
import { MessageContext } from "./MessageHandler";
import { API } from "../Api";

/**
 * Institution Select Box
 * @returns {JSX.Element}
 * @constructor
 */
export function Institution({
  onChangeInstitution,
  className,
  hideTitle,
  createable,
}) {
  const { pushError } = useContext(MessageContext);
  const [institution, setInstitution] = useState();
  const [institutionDatabase, setInstitutionDatabase] = useState(null);

  const institutionToOption = (ins) => ({
    value: ins.id,
    label: ins.name,
  });

  useEffect(() => {
    // Load institution options into Select component
    API.getInstitutionList()
      .then((response) => {
        const { data } = response;
        const options = [];
        for (let i = 0; i < data.length; i += 1) {
          options.push(institutionToOption(data[i]));
        }
        setInstitutionDatabase(options);
      })
      .catch(pushError);
  }, []); // Empty [] arg = do not re-run on re-render

  const handleCreate = (event) => {
    API.postNewInstitution(event)
      .then((response) => {
        const opt = institutionToOption(response.data);
        setInstitutionDatabase([opt, ...institutionDatabase]);
        setInstitution(opt);
        onChangeInstitution(opt.label);
      })
      .catch(pushError);
  };

  const changeSelect = (newValue) => {
    // NewValue is an object containing two members, .label and .value.
    setInstitution(newValue);
    onChangeInstitution(newValue);
  };

  /**
   * Render function for Institution picker component
   */
  return (
    <>
      {!hideTitle ? <p>Institution Name</p> : ""}
      {createable ? (
        <CreateableSelect
          name="institution"
          id="institution"
          className={className}
          defaultValue={institution}
          value={institution}
          onChange={changeSelect}
          onCreateOption={handleCreate}
          options={institutionDatabase}
          isClearable
          isLoading={institutionDatabase === null}
        />
      ) : (
        <Select
          name="institution"
          id="institution"
          className={className}
          defaultValue={institution}
          value={institution}
          onChange={changeSelect}
          options={institutionDatabase}
          isLoading={institutionDatabase === null}
        />
      )}
    </>
  );
}

export default Institution;
