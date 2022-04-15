import { Autocomplete, createFilterOptions } from "@material-ui/lab";
import SearchBar from "material-ui-search-bar";
import React, { useState } from "react";

const filterOptions = createFilterOptions({
    limit: 6
});

export default function AutocompleteSearchBar(props: any) {
    const value = props.value;
    const setValue = props.onChange;
    return (
        <Autocomplete
            filterOptions={filterOptions}
            className={props.className}
            style={props.style}
            freeSolo
            options={props.options}
            onChange={async (event: any, newValue: any) => {
                setValue(newValue ?? "");
                props.search(newValue ?? "")();
            }}
            renderInput={(params: any) => {
                return (
                    <>
                        <SearchBar
                            {...{ ...params.inputProps, ref: null }}
                            onCancelSearch={async () => {
                                setValue("");
                                props.search("")();
                            }}
                            style={props.style}
                            className={props.onlyMobile}
                            value={value}
                            onChange={(newValue) => {
                                if (newValue === "")
                                    props.search("")();
                                params.inputProps.onChange({ target: { value: newValue } });
                                setValue(newValue)
                            }}
                            onRequestSearch={props.onRequestSearch}
                        />
                        <div ref={params.InputProps.ref}>
                            <div {...params.inputProps} />
                        </div>
                    </>
                )
            }
            }
        />
    )
}