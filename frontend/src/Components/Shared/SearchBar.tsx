import { Autocomplete, AutocompleteRenderInputParams, createFilterOptions, FilterOptionsState } from "@material-ui/lab";
import SearchBar from "material-ui-search-bar";
import React, { ReactNode, useState } from "react";


//easily add tags
export enum searchTypes {
    tag = "#",
    image = "$",
    face = "@",
    text = "",
}

export const splitTypeAndText = (input: string): [searchTypes, string] => {
    for (const _st in searchTypes) {
        const st = searchTypes[_st as keyof typeof searchTypes];
        if (input.toLowerCase().startsWith(st)) {
            return [st, input.substring(st.length)];
        }
    }
    return [searchTypes.text, input];
}

export type OptionT = {
    label: string;
    searchType: searchTypes;
    icon: ReactNode;
    searchText: string;
}

const _filterOptions = createFilterOptions({
    limit: 6,
    stringify: (option: OptionT) => option.label,
});

const filterOptions = (options: OptionT[], state: FilterOptionsState<OptionT>) => {

    const [type, text] = splitTypeAndText(state.inputValue)


    const result = _filterOptions(options, { ...state, inputValue: text });
    if (type === searchTypes.text) {
        return result
    }
    return result.filter(o => o.searchType === type)
}

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
            getOptionLabel={((option: OptionT) => typeof option === "string" ? option : option.label) as any}
            renderOption={((option: OptionT) => (<React.Fragment >
                {option.icon}
                <div style={{ marginRight: 10 }} />
                {option.label}
            </React.Fragment>)) as any}
            onChange={async (event: any, option: any) => {
                option = option ?? "";
                const newValue = typeof option === "string" ? option : option.searchText;
                setValue(newValue);
                props.search(newValue)();
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