/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Link, List } from '@material-ui/core';
import { ViewReport, DashboardItemType } from '../../../types';
import { CheckboxList, Form as BaseForm } from '../../../components';
import { useForm } from 'react-hook-form';
import { Button } from '@tupaia/ui-components';
import { transformDownloadLink } from './transformDownloadLink';
import { useSearchParams } from 'react-router-dom';
import { URL_SEARCH_PARAMS } from '../../../constants';

const ListItem = styled.li`
  text-align: center;
  font-size: 1.25rem;
  &:not(:last-child) {
    margin-bottom: 0.625rem;
  }
`;

const Wrapper = styled.div`
  padding: 1rem;
  width: 25rem;
  max-width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const Form = styled(BaseForm)`
  flex-grow: 1;

  display: flex;
  flex-direction: column;
  > fieldset {
    flex-grow: 1;
    text-align: left;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 1.5rem;
`;

const FormButton = styled(Button)`
  text-transform: none;
`;

interface DataDownloadProps {
  report: ViewReport;
  config: DashboardItemType;
  isEnlarged?: boolean;
}

export const DataDownload = ({ report, config, isEnlarged }: DataDownloadProps) => {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const formContext = useForm({
    mode: 'onChange',
  });
  const { data } = report;
  if (!isEnlarged)
    return (
      <List>
        {data?.map(({ name }) => (
          <ListItem key={name}>{name}</ListItem>
        ))}
      </List>
    );

  const selectedCodes = formContext.watch(config.code as string);
  const downloadLink = transformDownloadLink(`/${report.downloadUrl}&surveyCodes=${selectedCodes}`);

  const closeModal = () => {
    urlSearchParams.delete(URL_SEARCH_PARAMS.REPORT);
    urlSearchParams.delete(URL_SEARCH_PARAMS.REPORT_PERIOD);
    setUrlSearchParams(urlSearchParams);
  };
  return (
    <Wrapper>
      <Form formContext={formContext}>
        <CheckboxList
          options={
            data
              ? data.map(({ name, value }) => ({
                  label: name,
                  value: value as string,
                }))
              : []
          }
          name={config.code as string}
          legend="Select the data you wish to download"
          required
        />

        <ButtonWrapper>
          <FormButton variant="outlined" color="default" onClick={closeModal}>
            Cancel
          </FormButton>
          <FormButton
            component={Link}
            disabled={!selectedCodes || selectedCodes.length === 0}
            href={downloadLink}
            download
            target="_blank"
            rel="noreferrer noopener"
          >
            Download
          </FormButton>
        </ButtonWrapper>
      </Form>
    </Wrapper>
  );
};
