--
-- PostgreSQL database dump
--

-- Dumped from database version 13.4
-- Dumped by pg_dump version 13.5 (Ubuntu 13.5-1.pgdg18.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics (
    entity_code character varying NOT NULL,
    date timestamp without time zone NOT NULL,
    data_element_code character varying NOT NULL,
    data_group_code character varying,
    event_id character varying NOT NULL,
    value character varying NOT NULL,
    value_type character varying NOT NULL,
    last_modified timestamp with time zone
);


--
-- Name: analytics analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics
    ADD CONSTRAINT analytics_pkey PRIMARY KEY (entity_code, date, data_element_code, event_id);


--
-- Name: analytics_data_element_entity_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX analytics_data_element_entity_date_idx ON public.analytics USING btree (data_element_code, entity_code, date DESC);


--
-- Name: analytics_data_group_entity_event_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX analytics_data_group_entity_event_date_idx ON public.analytics USING btree (data_group_code, entity_code, event_id, date DESC);


--
-- Name: TABLE analytics; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.analytics TO tupaia;


--
-- PostgreSQL database dump complete
--

